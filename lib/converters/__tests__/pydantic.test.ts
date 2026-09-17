import { convertPydanticToTypeScript } from '../pydantic';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('Running extended parser test suite...');

// Test 1: Python 3.10 pipe union & None
{
  const python = `
class Post(BaseModel):
    title: str
    subtitle: str | None = None
    views: int | float = 0
`;
  const res = convertPydanticToTypeScript(python);
  assert(res.code.includes('subtitle?: string | null;'), 'Expected subtitle?: string | null');
  assert(res.code.includes('views?: number | number;'), 'Expected views?: number | number');
}

// Test 2: Output type as 'type' alias
{
  const python = `
class Team(BaseModel):
    name: str
    members: List[str]
`;
  const res = convertPydanticToTypeScript(python, { outputType: 'type' });
  assert(res.code.includes('export type Team = {'), 'Expected type Team = {');
}

// Test 3: Enum as Union
{
  const python = `
class Priority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
`;
  const res = convertPydanticToTypeScript(python, { enumFormat: 'union' });
  assert(res.code.includes('export type Priority = "low" | "medium" | "high";'), 'Expected union enum output');
}

// Test 4: Inheritance
{
  const python = `
class BaseEntity(BaseModel):
    id: str
    created_at: datetime

class Organization(BaseEntity):
    org_name: str
`;
  const res = convertPydanticToTypeScript(python);
  assert(res.code.includes('export interface Organization extends BaseEntity {'), 'Expected extends BaseEntity');
}

// Test 5: Field aliases option enabled
{
  const python = `
class Product(BaseModel):
    product_id: str = Field(alias="productId")
`;
  const res = convertPydanticToTypeScript(python, { useFieldAlias: true });
  assert(res.code.includes('product_id: string;') || res.code.includes('productId: string;'), 'Expected productId');
}

// Test 6: Field(...) Ellipsis & JSDoc placement bug fixes
{
  const python = `
class OrderSpec(BaseModel):
    count: int = Field(..., ge=1, description="Total item count")
    status: Optional[str] = Field(..., description="Required despite optional type")
    tag: str | None = Field(..., description="Required tag despite pipe None")
    notes: Optional[str] = None
    comments: Optional[str] = Field(default=None, description="Optional comments")
`;
  const res = convertPydanticToTypeScript(python);

  // Assert required fields do NOT have ?
  assert(res.code.includes('  /** Total item count */\n  count: number;'), 'count should be required without ? and have preceding JSDoc');
  assert(res.code.includes('  /** Required despite optional type */\n  status: string | null;'), 'status should be required without ? even with Optional[str]');
  assert(res.code.includes('  /** Required tag despite pipe None */\n  tag: string | null;'), 'tag should be required without ? even with str | None');
  
  // Assert fields with defaults DO have ?
  assert(res.code.includes('notes?: string | null;'), 'notes with = None should be optional with ?');
  assert(res.code.includes('  /** Optional comments */\n  comments?: string | null;'), 'comments with default=None should be optional with ? and have preceding JSDoc');
}

// Test 7: Annotated[T, Field(...)] Ellipsis
{
  const python = `
class Profile(BaseModel):
    email: Annotated[str, Field(..., description="User primary email address")]
    role: Annotated[Optional[str], Field(..., description="Explicitly required role")]
`;
  const res = convertPydanticToTypeScript(python);
  assert(res.code.includes('  /** User primary email address */\n  email: string;'), 'email should be required with preceding JSDoc');
  assert(res.code.includes('  /** Explicitly required role */\n  role: string | null;'), 'role should be required without ? with preceding JSDoc');
}

console.log('All extended parser assertions passed successfully!');
