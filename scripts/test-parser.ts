import { convertPydanticToTypeScript } from '../lib/converters/pydantic';

const samplePydantic = `
from pydantic import BaseModel, Field, EmailStr, HttpUrl, ConfigDict
from typing import Optional, List, Dict, Union, Literal, Tuple, Set, Annotated
from enum import Enum
from datetime import datetime
from uuid import UUID

class Role(str, Enum):
    """User access role in the system."""
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

class Address(BaseModel):
    street: str
    city: str
    zip_code: str = Field(..., alias="zipCode", description="US Postal code")
    is_primary: bool = True

class UserProfile(BaseModel):
    """Core user profile entity."""
    model_config = ConfigDict(populate_by_name=True)

    id: UUID
    username: str
    email: EmailStr
    bio: Optional[str] = None
    role: Role = Role.VIEWER
    avatar_url: Optional[HttpUrl] = Field(default=None, description="Public CDN link to profile avatar")
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Union[str, int, bool]] = Field(default_factory=dict)
    login_count: int = 0
    scores: Tuple[float, float, float] = (0.0, 0.0, 0.0)
    created_at: datetime
    status: Literal["active", "suspended", "pending"] = "active"

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    size: int
    has_next: bool = False
`;

console.log('--- Testing Pydantic Converter ---');
const result = convertPydanticToTypeScript(samplePydantic, {
  outputType: 'interface',
  exportTypes: true,
  optionalFieldsWithDefaults: true,
  nullabilityStrategy: 'null',
  enumFormat: 'enum',
  includeJSDoc: true,
});

console.log('--- Generated TypeScript ---');
console.log(result.code);
console.log('-----------------------------');
console.log(`Classes parsed: ${result.classesParsed}`);
console.log(`Enums parsed: ${result.enumsParsed}`);
console.log(`Type aliases: ${result.typeAliasesParsed}`);

if (result.error) {
  console.error('FAILED with error:', result.error);
  process.exit(1);
} else {
  console.log('SUCCESS: Parser tests passed successfully!');
}
