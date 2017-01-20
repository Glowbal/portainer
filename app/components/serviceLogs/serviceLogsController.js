angular.module('serviceLogs', [])
.controller('ServiceLogsController', ['$scope', '$stateParams', '$anchorScroll', 'Version', 'VersionHelper', 'Node', 'ServiceLogs', 'Service', 'Messages',
function ($scope, $stateParams, $anchorScroll, Version, VersionHelper, Node, ServiceLogs, Service, Messages) {
  $scope.state = {};
  $scope.state.displayTimestampsOut = false;
  $scope.state.displayTimestampsErr = false;
  $scope.stdout = '';
  $scope.stderr = '';
  $scope.tailLines = 2000;

  $scope.nodes = {};

  var requiredMinApiVersion = '1.25';

  $('#loadingViewSpinner').show();
  Service.get({id: $stateParams.id}, function (d) {
    $scope.service = new ServiceViewModel(d);
    $('#loadingViewSpinner').hide();
  }, function (e) {
    $('#loadingViewSpinner').hide();
    Messages.error("Failure", e, "Unable to retrieve service info");
  });

  function getLogs() {
    $('#loadingViewSpinner').show();
    getLogsStdout();
    getLogsStderr();
    $('#loadingViewSpinner').hide();
  }

  function parseLogData(data) {
    // Replace carriage returns with newlines to clean up output
    data = data.replace(/[\r]/g, '\n');
    // Strip 8 byte header from each line of output
    data = data.substring(8);
    data = data.replace(/\n(.{8})/g, '\n');

    var lines = data.split('\n').map(function(line) {
      var splittedData = line.split(/\s(.+)/);
      var metaData = splittedData[0];
      var logLine = splittedData.length >= 2 ? splittedData[1] : '';

      var capture = metaData.match(/com.docker.swarm.node.id=(.+),com.docker.swarm.service.id=(.+),com.docker.swarm.task.id=(.+)/);
      var nodeId = capture ? capture[1] : 'unknown';
      var serviceId = capture ? capture[2] : 'unknown';
      var taskId = capture ? capture[3] : 'unknown';

      var node = $scope.nodes[nodeId];
      if (!node) {
        getNodes();

        node = {
          Description: { Hostname: nodeId }
        }
      }
      return taskId.substring(0, 8) + '@' + node.Description.Hostname + ' | ' + logLine;
    });

    return lines.join('\n');
  }

  function getLogsStderr() {
    ServiceLogs.get($stateParams.id, {
      stdout: false,
      stderr: true,
      timestamps: $scope.state.displayTimestampsErr,
      tail: $scope.tailLines
    }, function (data, status, headers, config) {
      $scope.stderr = parseLogData(data);
    });
  }

  function getLogsStdout() {
    ServiceLogs.get($stateParams.id, {
      stdout: true,
      stderr: false,
      timestamps: $scope.state.displayTimestampsOut,
      tail: $scope.tailLines
    }, function (data, status, headers, config) {
      $scope.stdout = parseLogData(data);
    });
  }

  function getNodes(cb) {
    Node.query({}, function (nodes) {
      nodes.forEach(function(node) {
        $scope.nodes[node.ID] = node;
      });
      if (cb) {cb()};
    }, function (e) {
      Messages.error("Failure", e, "Unable to retrieve node information");
    });
  }

  Version.get({}, function (versionData) {
    $scope.version = versionData;
    if (VersionHelper.isMinVersion(versionData.ApiVersion, '1.24')) {
      getNodes(function() {
        getLogs();
        var logIntervalId = window.setInterval(getLogs, 5000);
        $scope.$on("$destroy", function () {
          // clearing interval when view changes
          clearInterval(logIntervalId);
        });
      });
    } else {
      $scope.invalidVersion = true;
    }
  }, function (e) {
    Messages.error("Failure", e, 'Unable to retrieve version details');
  });

  $scope.refreshStdOut = function () {
    getLogsStdout();
  };

  $scope.refreshErr = function () {
    getLogsStderr();
  };

}]);
