# API 명세 초안

## GET /api/products
Query:
- `q`
- `category`
- `process`
- `material`
- `region`
- `verified`
- `page`

Response:
```json
{
  "items": [],
  "page": 1,
  "total": 0,
  "facets": {
    "categories": [],
    "processes": [],
    "materials": []
  }
}
```

## GET /api/products/:slug
포함:
- product
- category
- processes
- materials
- supplierProducts
- documents
- knowledge

## GET /api/suppliers
Filter:
- q
- supplierType
- process
- region
- verified

## GET /api/suppliers/:slug
포함:
- supplier profile
- verification flags
- supplierProducts
- certifications/documents
- related knowledge

## POST /api/rfq
Request:
```json
{
  "companyName": "Delta ES",
  "contactName": "Kim",
  "email": "buyer@example.com",
  "targetDate": "2026-12-31",
  "application": "Dry Etching",
  "requirements": "300 mm chamber compatible",
  "items": [
    {"productId": "...", "productName": "CVD-SiC Focus Ring", "quantity": 10, "unit": "EA"}
  ]
}
```

Response:
```json
{"id":"...","status":"SUBMITTED"}
```
