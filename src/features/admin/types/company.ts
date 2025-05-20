// Şirket verisi için tip tanımı (API dokümantasyonuna göre)
export interface Company {
  id: string; // UUID
  name: string;
  identifier?: string;
  type?: 'CUSTOMER' | 'PARTNER' | 'VENDOR';
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DELETED';
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
  userCount?: number;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
}

// API yanıtı için tip tanımı (Spring Data JPA Pageable yanıtı)
export interface CompaniesResponse {
  content: Company[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  size: number;
  number: number;
  empty: boolean;
}
