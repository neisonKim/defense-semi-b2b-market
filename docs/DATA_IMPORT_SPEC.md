# 상품 / 공급사 DB 등록 명세

## 1. Product Import CSV
필수 컬럼:
- slug
- name
- category_slug
- manufacturing_method
- application_process_slug
- material_slug
- equipment
- application_location
- function_summary
- source_url
- verification_status

선택 컬럼:
- subtitle
- wafer_size
- purity
- lifecycle
- last_verified_at
- verified_by

## 2. Supplier Import CSV
필수 컬럼:
- slug
- name
- supplier_type
- country
- website_url
- source_url
- verification_status

선택 컬럼:
- legal_name
- regions (pipe-separated: KR|JP|US)
- description
- company_verified
- product_data_verified
- document_verified
- last_verified_at

## 3. SupplierProduct Import CSV
Product ↔ Supplier 관계 데이터.

필수 컬럼:
- product_slug
- supplier_slug

선택 컬럼:
- sku
- region
- lead_time_days
- moq
- authorized_status
- price_type
- price_min
- price_max
- currency
- availability
- sample_available
- customization

## 4. 검증 규칙
- source_url이 없는 Product는 `PUBLISHED` 금지.
- Authorized Distributor는 계약/공식 페이지 출처 필요.
- last_verified_at이 365일 이상 지난 데이터는 `NEEDS_UPDATE` 후보.
- 제품 적용공정과 소재 제조공법을 별도 필드로 저장.
- AI 생성 텍스트는 검토 전 `DRAFT` 유지.

## 5. 파일 업로드 규칙
Datasheet / Catalog / Certificate 등은 DB에 바이너리를 직접 저장하지 않고 Object Storage에 저장 후 URL만 DB에 보관.

권장 경로:
`/documents/{supplierSlug}/{productSlug}/{documentType}/{filename}`
