## Table `categories`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `name` | `json` |  |
| `slug` | `varchar` | Unique |

## Table `ai_settings`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `chat_provider` | `varchar` |  |
| `chat_model` | `varchar` |  |
| `embedding_provider` | `varchar` |  |
| `embedding_model` | `varchar` |  |
| `updated_at` | `timestamptz` |  |
| `google_client_id` | `varchar` |  Nullable |
| `database_url` | `varchar` |  Nullable |
| `system_prompt` | `text` |  Nullable |
| `google_client_secret` | `varchar` |  Nullable |

## Table `alembic_version`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `version_num` | `varchar` | Primary |

## Table `order_items`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `order_id` | `varchar` | Foreign Key (orders.id) |
| `product_id` | `varchar` | Foreign Key (products.id) |
| `qty` | `int4` |  |
| `price` | `int4` |  |
| `days` | `int4` |  Nullable |

## Table `orders`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `order_number` | `varchar` |  |
| `customer` | `varchar` |  |
| `email` | `varchar` |  |
| `phone` | `varchar` |  |
| `total` | `int4` |  |
| `deposit` | `int4` |  |
| `status` | `order_status` |  |
| `event_date` | `date` |  |
| `notes` | `text` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |
| `user_id` | `varchar` | Foreign Key (users.id), Nullable |
| `payment_proof` | `varchar` |  Nullable |

## Table `products`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `slug` | `varchar` |  |
| `name` | `json` |  |
| `category` | `varchar` | Foreign Key (categories.id) |
| `price` | `int4` |  |
| `price_per_day` | `bool` |  |
| `image` | `varchar` |  |
| `gallery` | `json` |  |
| `description` | `json` |  |
| `details` | `json` |  |
| `available` | `bool` |  |
| `trending` | `bool` |  |
| `discount` | `int4` |  |
| `embedding` | `vector` |  Nullable |
| `search_vector` | `tsvector` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `store_policies`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `policy_type` | `varchar` |  |
| `locale` | `varchar` |  |
| `title` | `varchar` |  Nullable |
| `content` | `text` |  |
| `embedding` | `vector` |  Nullable |
| `search_vector` | `tsvector` |  Nullable |
| `created_at` | `timestamptz` |  |
| `updated_at` | `timestamptz` |  |

## Table `studio_profile`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary |
| `name` | `varchar` |  |
| `address` | `varchar` |  |
| `email` | `varchar` |  |
| `bank_name` | `varchar` |  |
| `bank_account` | `varchar` |  |
| `bank_beneficiary` | `varchar` |  |
| `facebook_link` | `varchar` | Nullable |
| `instagram_link` | `varchar` | Nullable |
| `updated_at` | `timestamptz` |  |

## Table `users`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `email` | `varchar` |  Unique |
| `full_name` | `varchar` |  Nullable |
| `role` | `user_role` |  |
| `permission` | `user_permission` |  |
| `google_id` | `varchar` |  Nullable |
| `created_at` | `timestamptz` |  Nullable |
| `updated_at` | `timestamptz` |  Nullable |
| `username` | `varchar` |  Unique |
| `hashed_password` | `varchar` |  Nullable |

## Table `vouchers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `varchar` | Primary |
| `code` | `varchar` |  |
| `discount_percent` | `int4` |  |
| `active` | `bool` |  |
| `expires_at` | `timestamptz` |  Nullable |

