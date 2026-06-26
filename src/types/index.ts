export interface TokenPairResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessExpiresIn: number;
  refreshExpiresIn: number;
}

export interface ValidateResponse {
  valid: boolean;
  userId?: string;
  username?: string;
  role?: string;
}

export interface MessageResponse {
  message: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

export interface Balance {
  accountId: string;
  availableAmount: number;
  blockedAmount: number;
  totalAmount: number;
  currencyCode: string;
  lastUpdated: string;
}

export interface AccountResponse {
  id: string;
  userId: string;
  iban: string;
  accountNumber: string;
  accountType: 'CURRENT' | 'SAVINGS' | 'BUSINESS' | 'UNKNOWN';
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED' | 'UNKNOWN';
  balance: Balance;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  branchName?: string;
  currency?: string;
}

export interface CardLimits {
  daily: number;
  monthly: number;
  single: number;
  currency: string;
}

export interface CardResponse {
  id: string;
  accountId: string;
  userId: string;
  maskedPan: string;
  cardType: 'DEBIT' | 'CREDIT' | 'VIRTUAL';
  expiryDate: string;
  status: 'ACTIVE' | 'BLOCKED' | 'EXPIRED';
  currencyCode: string;
  limits: CardLimits;
  issuedAt: string;
  updatedAt: string;
  pinSet: boolean;
}

export interface CardTransactionResponse {
  id: string;
  amount: number;
  currencyCode: string;
  merchantName: string;
  merchantCategory: string;
  terminalId: string;
  reference: string;
  status: 'PENDING' | 'APPROVED' | 'FAILED' | 'DECLINED' | 'REVERSED' | 'BLOCKED';
  occurredAt: string;
}

export interface TransactionResponse {
  id: string;
  sourceAccountId: string;
  destinationAccountId?: string;
  amount: number;
  currency: string;
  type: 'INTRA_BANK' | 'INTER_BANK' | 'CARD_PAYMENT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  description?: string;
  reference?: string;
  cardId?: string;
  merchantName?: string;
  failureReason?: string;
  initiatedAt: string;
  executedAt?: string;
}

export interface ScheduledTransactionResponse {
  id: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  frequency: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  description?: string;
  scheduledAt: string;
  nextExecutionDate?: string;
  createdAt: string;
}

export interface NotificationResponse {
  id: string;
  userId: string;
  eventType: string;
  title: string;
  message: string;
  channel: 'IN_APP' | 'EMAIL' | 'SMS';
  status: 'PENDING' | 'SENT' | 'READ' | 'FAILED';
  createdAt: string;
  sentAt?: string;
  readAt?: string | null;
}

export interface UserSettingsResponse {
  emailNotificationsEnabled: boolean;
  internalNotificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod: string | null;
}

export interface RegisterRequest {
  firstName: string;
  secondName: string;
  thirdName: string;
  username: string;
  password: string;
  egn: string;
  birthDate: string;
  phoneNumber: string;
  email: string;
}

export interface TransferRequest {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  description?: string;
}

export interface CardPaymentRequest {
  cardId: string;
  amount: number;
  currency: string;
  merchantName: string;
  merchantCategory: string;
  terminalId: string;
}

export interface ScheduledRequest {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  currency: string;
  frequency: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  scheduledAt: string;
  description?: string;
}

export interface AuthUser {
  userId: string;
  username: string;
  role: string;
}
