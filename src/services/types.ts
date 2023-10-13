export interface inputEmpty {
  scope: "scope1" | "scope2" | "scope3";
  name: string;
  value: number;
  equivalent: number;
  manualEquivalent: null | number;
  validity: "P1M" | "P1Y";
  timestamp: string;
}

export interface input extends inputEmpty {
  id: string;
}

export interface equivalentEmpty {
  name: string;
  value: number;
  comment: null | string;
}

export interface equivalent extends equivalentEmpty {
  id: string;
}
