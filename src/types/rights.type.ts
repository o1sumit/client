// Application entity
export interface Application {
  application_id: string;
  application_name: string;
  client_secret: string;
  version: string;
  created_on: string; // ISO timestamp
  updated_on: string; // ISO timestamp
  created_by: string;
}

// Account entity
export interface Account {
  account_id: string;
  account_name: string;
  account_type: "temporary" | "personal" | "business";
  status: "active" | "inactive";
  created_on: string; // ISO timestamp
  updated_on: string; // ISO timestamp
}

// GrantedBy entity
export interface GrantedBy {
  user_id: string;
  username: string;
}

// Main Rights entity
export interface Rights {
  rights_id: string;
  account_id: string;
  application_id: string;
  rights_code: string; // Stored as JSON string, e.g. '{"fm":"read"}'
  created_on: string; // ISO timestamp
  updated_on: string; // ISO timestamp
  granted_by: string;
  application: Application;
  account: Account;
  grantedBy: GrantedBy;
}

export type RightsRow = {
  rights_id: string;
  application_id: string;
  application_name: string;
  account_id: string;
  account_name: string;
  rights_code: string;
  expires_on?: string;
  granted_by?: string;
  created_on: string;
  updated_on: string;
};
