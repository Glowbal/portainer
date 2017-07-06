angular.module('portainer.rest')
.factory('Swarm', ['$resource', 'DOCKER_ENDPOINT', 'EndpointProvider', function SwarmFactory($resource, DOCKER_ENDPOINT, EndpointProvider) {
  'use strict';
  return $resource(DOCKER_ENDPOINT + '/:endpointId/swarm/:action', {
    endpointId: EndpointProvider.endpointID
  },
  {
    get: {method: 'GET'},
    init: { method: 'POST', params: { action: 'init' }},
    update: { method: 'POST', params: { action: 'update', version: '@version', rotateWorkerToken: '@rotateWorkerToken' }},
    leave: { method: 'POST', params: { action: 'leave' }},
    join: { method: 'POST', params: { action: 'join' }},
    unlockKey: { method: 'GET', params: { action: 'unlockkey' }},
    unlock: {method: 'POST', params: { action: 'unlock' }}
  });
}]);
