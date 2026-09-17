export interface ExamplePreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  code: string;
}

export const PYDANTIC_EXAMPLES: ExamplePreset[] = [
  {
    id: 'user-profile-v2',
    name: 'User & Profile (Pydantic v2)',
    badge: 'v2 Models',
    description: 'Pydantic v2 model with ConfigDict, Field descriptions, EmailStr, Optional, and UUID.',
    code: `from pydantic import BaseModel, Field, EmailStr, HttpUrl, ConfigDict
from typing import Optional, List, Dict, Annotated
from uuid import UUID
from datetime import datetime

class SocialLinks(BaseModel):
    github: Optional[HttpUrl] = None
    twitter: Optional[HttpUrl] = None
    website: Optional[HttpUrl] = None

class User(BaseModel):
    """Represents an active user account in the application."""
    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

    id: UUID
    username: Annotated[str, Field(min_length=3, max_length=50, description="Unique handle")]
    email: EmailStr
    is_active: bool = True
    bio: Optional[str] = Field(default=None, max_length=500, description="Short user biography")
    socials: Optional[SocialLinks] = None
    tags: List[str] = Field(default_factory=list)
    preferences: Dict[str, bool] = Field(default_factory=dict)
    created_at: datetime
    updated_at: Optional[datetime] = None
`,
  },
  {
    id: 'ecommerce-orders',
    name: 'E-Commerce Orders & Inventory',
    badge: 'Enums & Nesting',
    description: 'Multi-level nested models with Python Enums, lists of items, Decimal pricing, and status unions.',
    code: `from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum
from datetime import datetime

class OrderStatus(str, Enum):
    """Current fulfillment stage of the order."""
    PENDING = "pending"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class PaymentMethod(str, Enum):
    CREDIT_CARD = "credit_card"
    PAYPAL = "paypal"
    STRIPE = "stripe"
    CRYPTO = "crypto"

class OrderItem(BaseModel):
    sku: str = Field(..., description="Stock keeping unit identifier")
    name: str
    quantity: int = Field(1, ge=1)
    unit_price: float
    discount_pct: float = 0.0

class ShippingAddress(BaseModel):
    street: str
    city: str
    state: str
    postal_code: str = Field(..., alias="postalCode")
    country: str = "US"

class Order(BaseModel):
    """Comprehensive e-commerce order schema."""
    order_id: str
    customer_id: str
    status: OrderStatus = OrderStatus.PENDING
    items: List[OrderItem]
    shipping_address: ShippingAddress
    payment_method: PaymentMethod
    subtotal: float
    tax: float = 0.0
    shipping_cost: float = 0.0
    total: float
    notes: Optional[str] = None
    tracking_number: Optional[str] = None
    placed_at: datetime
`,
  },
  {
    id: 'fastapi-response',
    name: 'FastAPI Generic Paginated API',
    badge: 'Generics & API',
    description: 'FastAPI generic response wrappers, error models, and pagination metadata.',
    code: `from pydantic import BaseModel, Field
from typing import Generic, TypeVar, List, Optional, Union, Literal

T = TypeVar("T")

class PaginationMeta(BaseModel):
    page: int = Field(1, ge=1, description="Current 1-indexed page")
    per_page: int = Field(20, ge=1, le=100, description="Items per page")
    total_items: int = Field(..., description="Total count across all pages")
    total_pages: int
    has_next: bool
    has_prev: bool

class ErrorDetail(BaseModel):
    code: str
    message: str
    field: Optional[str] = None

class ApiResponse(BaseModel, Generic[T]):
    """Standardized REST API JSON envelope."""
    status: Literal["success", "error"] = "success"
    data: Optional[T] = None
    errors: Optional[List[ErrorDetail]] = None
    meta: Optional[PaginationMeta] = None
`,
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline & ML Config',
    badge: 'Complex Types',
    description: 'Complex types: Tuples, Dicts with Union values, Literal types, and Python 3.10+ pipe unions.',
    code: `from pydantic import BaseModel, Field
from typing import Tuple, Dict, Union, Literal, Any, List

class ModelHyperparameters(BaseModel):
    learning_rate: float = 0.001
    batch_size: int = 64
    epochs: int = 100
    optimizer: Literal["adam", "sgd", "adamw"] = "adam"
    dropout: float = 0.2
    layers: List[int] = Field(default_factory=lambda: [512, 256, 128])

class DatasetSplit(BaseModel):
    train_ratio: float = 0.8
    val_ratio: float = 0.1
    test_ratio: float = 0.1
    stratify_column: str | None = None
    random_seed: int = 42

class PipelineJob(BaseModel):
    """Configuration for an asynchronous ML training pipeline execution."""
    job_id: str
    model_name: str
    dimensions: Tuple[int, int, int]
    hyperparameters: ModelHyperparameters
    dataset: DatasetSplit
    custom_metrics: Dict[str, float | int | str] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    priority: Literal["low", "medium", "high", "critical"] = "medium"
`,
  },
];
