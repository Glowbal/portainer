function SwarmMode(data) {
  var spec = data.Spec;

  var orchestration = spec.Orchestration;
  var raft = spec.Raft;
  var dispatcher = spec.Dispatcher;
  var CAConfig = spec.CAConfig;
  var TaskDefaults = spec.TaskDefaults;
  var encryptionConfig = spec.EncryptionConfig;

  this.ID = data.ID;
  this.Version = data.Version.Index;
  this.CreatedAt = data.CreatedAt;
  this.UpdatedAt = data.UpdatedAt;
  this.Name = spec.Name;
  this.Labels = spec.Labels;
  this.TaskHistoryRetentionLimit = orchestration.TaskHistoryRetentionLimit;

  this.SnapshotInterval = raft.SnapshotInterval;
  this.KeepOldSnapshots = raft.KeepOldSnapshots;
  this.LogEntriesForSlowFollowers = raft.LogEntriesForSlowFollowers;
  this.ElectionTick = raft.ElectionTick;
  this.HeartbeatTick = raft.HeartbeatTick;

  this.HeartbeatPeriod = dispatcher.HeartbeatPeriod;

  this.NodeCertExpiry = CAConfig.NodeCertExpiry;
  this.TaskDefaults = TaskDefaults;

  this.AutoLockManagers = encryptionConfig.AutoLockManagers;

  this.TLSInfo = data.TLSInfo;
  this.RootRotationInProgress = data.RootRotationInProgress;
  this.JoinTokens = data.JoinTokens;
}
