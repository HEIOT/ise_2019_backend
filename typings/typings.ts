export interface ITag {
  name: string;
}

export interface IDeviceTag {
  device_id: string;
  tag_id: string;
}

export interface IMasterData {
  device_id: string;
  category_id: string;
  value: string;
}

export interface IDevice {
  name: string;
  device_id: string;
}

export interface IDeviceIncontext {
  businessId: string;
  deviceId: string;
}

export interface IId {
  id: string;
}

export interface IDeviceTagMasterData {
  id: string;
  name: string;
  device_id: string;
  tag_id: string;
  category_id: string;
  value: string;
}

export interface IData {
  id: string;
  device_id: number;
  date: string;
  data: IDataValue[];
}

export interface IDataValue {
  name: string;
  type: string;
  value: number;
}

export interface IDataFlat {
  device_id: number;
  date: string;
  value_type: string;
  value_name: string;
  value: number;
}

export interface ISensorData {
  deviceId: string;
  date: {
    s: string;
    tz: string;
    v: number;
  };
  sensors: ISensorValue[];
}

export interface ISensorValue {
  name: string;
  type: string;
  value: number;
  date: {
    s: string;
    tz: string;
    v: number;
  };
}

export interface ISensorValueSimple {
  value: number;
  timestamp: number;
}

export interface ISpike {
  id: string;
  timestamp: number;
  attribute: string;
  value: number;
  moving_average: number;
}

export interface IAnomaly {
  device_id: number;
  attribute: string;
  type: "spike" | "threshold" | "dropout";
  timestamp: number;
}

export interface IThresholdDevice {
  device_id: number;
  attribute: string;
  timestamp: number;
  state: "urgent" | "warning";
}

export interface IHistoricalState {
  device_id: number;
  timestamp: Date;
  state: string;
  anomaly_id: number;
}
