import { ENV } from '@paima/sdk/utils';
import { buildEndpointErrorFxn, MiddlewareErrorCode } from '../errors';
import type { PackedLobbyRaw, PackedLobbyState, RoundEnd } from '../types';
import { PaimaMiddlewareErrorCode } from '@paima/sdk/mw-core';

export function userJoinedLobby(nftId: number, lobby: PackedLobbyState): boolean {
  if (!lobby.hasOwnProperty('lobby')) {
    return false;
  }
  const lobbyState = lobby.lobby;
  const lobbyPlayer = lobbyState.players.find(player => player.nftId === nftId);
  return lobbyPlayer != null;
}

export function userCreatedLobby(nftId: number, lobby: PackedLobbyState): boolean {
  if (!lobby.hasOwnProperty('lobby')) {
    return false;
  }
  const lobbyState = lobby.lobby;

  if (!lobbyState.hasOwnProperty('lobby_creator')) {
    return false;
  }
  if (lobbyState.lobby_creator == null) {
    return false;
  }
  return lobbyState.lobby_creator === nftId;
}

export function lobbyWasClosed(lobby: PackedLobbyRaw): boolean {
  const { lobby: lobbyState } = lobby;
  if (!lobbyState) {
    return false;
  }

  return lobbyState.lobby_state === 'closed';
}

export function calculateRoundEnd(
  roundStart: number,
  roundLength: number,
  current: number
): RoundEnd {
  const errorFxn = buildEndpointErrorFxn('calculateRoundEnd');

  let roundEnd = roundStart + roundLength;
  if (roundEnd < current) {
    errorFxn(MiddlewareErrorCode.CALCULATED_ROUND_END_IN_PAST);
    roundEnd = current;
  }

  try {
    const blocksToEnd = roundEnd - current;
    const secsPerBlock = ENV.BLOCK_TIME;
    const secondsToEnd = blocksToEnd * secsPerBlock;
    return {
      blocks: blocksToEnd,
      seconds: secondsToEnd,
    };
  } catch (err) {
    errorFxn(PaimaMiddlewareErrorCode.INTERNAL_INVALID_DEPLOYMENT, err);
    return {
      blocks: 0,
      seconds: 0,
    };
  }
}
