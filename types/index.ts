export interface RootObject_Inspection_Schedule {
  date?: number;
  startTime?: number;
  endTime?: number;
}

export interface RootObject_Inspection_Clientinfo {
  name?: string;
  email?: string;
  phone?: string;
  userType?: string;
  id?: string;
  date?: string;
}

export interface RootObject_Inspection_Inspector {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  accountId?: string;
  roles?: string[];
  createdAt?: number;
  updatedAt?: number;
  colorHex?: string;
  colorId?: string;
}

export interface RootObject_Inspection_Address_Propertyinfo {
  squareFootage?: number;
}

export interface RootObject_Inspection_Address {
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  fullAddress?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  propertyInfo?: RootObject_Inspection_Address_Propertyinfo;
}

export interface RootObject_Inspection_AgentsItem_Agent_Company {
  name?: string;
}

export interface RootObject_Inspection_AgentsItem_Agent {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: RootObject_Inspection_AgentsItem_Agent_Company;
}

export interface RootObject_Inspection_AgentsItem {
  id?: string;
  agent?: RootObject_Inspection_AgentsItem_Agent;
  source?: string;
  addedAt?: number;
  addedBy?: string;
  isPrimary?: number;
}

export interface RootObject_Inspection_Payment {
  status?: string;
  paymentIntentId?: string;
}

export interface RootObject_Inspection_ServicesItem {
  name?: string;
  hours?: number;
  price?: number;
  source?: string;
  modifierId?: string;
  associatedLabel?: string;
}

export interface RootObject_Inspection_Bookingformdata_Schedule {
  date?: number;
  startTime?: number;
  endTime?: number;
}

export interface RootObject_Inspection_Bookingformdata_Payment {
  status?: string;
  paymentIntentId?: string;
}

export interface RootObject_Inspection_Bookingformdata_BreakdownItem {
  name?: string;
  hours?: number;
  price?: number;
  source?: string;
  modifierId?: string;
  associatedLabel?: string;
}

export interface RootObject_Inspection_Bookingformdata_Propertyinfo_Propertyinfo {
  squareFootage?: number;
}

export interface RootObject_Inspection_Bookingformdata_Propertyinfo {
  city?: string;
  state?: string;
  street?: string;
  zipcode?: string;
  latitude?: number;
  longitude?: number;
  propertyInfo?: RootObject_Inspection_Bookingformdata_Propertyinfo_Propertyinfo;
  squareFootage?: number;
}

export interface RootObject_Inspection_Bookingformdata_Preferredtimes {
  time?: string;
  inspectorId?: string;
  autoAssignInspector?: number;
}

export interface RootObject_Inspection_Bookingformdata {
  status?: string;
  payment?: RootObject_Inspection_Bookingformdata_Payment;
  schedule?: RootObject_Inspection_Bookingformdata_Schedule;
  accountID?: string;
  breakdown?: RootObject_Inspection_Bookingformdata_BreakdownItem[];
  serviceID?: string;
  clientInfo?: RootObject_Inspection_Clientinfo;
  totalHours?: number;
  totalPrice?: number;
  propertyInfo?: RootObject_Inspection_Bookingformdata_Propertyinfo;
  bookingSource?: string;
  paymentOption?: string;
  preferredTimes?: RootObject_Inspection_Bookingformdata_Preferredtimes;
  selectedAddons?: string[];
  distanceInMiles?: number;
  specialFeatures?: string[];
  assignedInspectorId?: string;
  isLocationSelectedViaGoogle?: number;
}

export interface RootObject_Inspection_SectionsItem_LineItemsItem_CommentsItem_PhotosItem {
  url?: string;
  caption?: string;
  type?: string;
}

export interface RootObject_Inspection_SectionsItem_LineItemsItem_CommentsItem_VideosItem {
  url?: string;
  caption?: string;
  type?: string;
}

export interface RootObject_Inspection_SectionsItem_LineItemsItem_CommentsItem {
  id?: string;
  text?: string;
  order?: number;
  photos?: RootObject_Inspection_SectionsItem_LineItemsItem_CommentsItem_PhotosItem[];
  videos?: RootObject_Inspection_SectionsItem_LineItemsItem_CommentsItem_VideosItem[];
  severity?: string;
}

export interface RootObject_Inspection_SectionsItem_LineItemsItem {
  id?: string;
  name?: string;
  order?: number;
  comments?: RootObject_Inspection_SectionsItem_LineItemsItem_CommentsItem[];
}

export interface RootObject_Inspection_SectionsItem {
  id?: string;
  name?: string;
  order?: number;
  linkedTo?: string;
  linkedToType?: string;
  linkedToName?: string;
  templateId?: string;
  lineItems?: RootObject_Inspection_SectionsItem_LineItemsItem[];
}

export interface RootObject_Inspection {
  id?: string;
  accountID?: string;
  status?: string;
  schedule?: RootObject_Inspection_Schedule;
  clientInfo?: RootObject_Inspection_Clientinfo;
  inspector?: RootObject_Inspection_Inspector;
  address?: RootObject_Inspection_Address;
  paymentStatus?: string;
  fee?: number;
  servicesID?: string[];
  templateIDs?: string[];
  addonsID?: string[];
  agents?: RootObject_Inspection_AgentsItem[];
  bookingFormData?: RootObject_Inspection_Bookingformdata;
  headerImageUrl?: string;
  sections?: RootObject_Inspection_SectionsItem[];
}

export interface RootObject_Account_Companyaddress {
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
}

export interface RootObject_Account_Subscriptioninfo {
  plan?: string;
  renewalDate?: string;
  status?: string;
}

export interface RootObject_Account {
  id?: string;
  companyName?: string;
  companyLogo?: string;
  email?: string;
  phoneNumber?: string;
  name?: string;
  companyAddress?: RootObject_Account_Companyaddress;
  createdAt?: number;
  updatedAt?: number;
  subscription?: RootObject_Account_Subscriptioninfo;
  logoUrl?: string;
}

export interface RootObject {
  inspection?: RootObject_Inspection;
  account?: RootObject_Account;
}
