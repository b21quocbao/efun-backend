import { EventEntity } from 'src/modules/events/entities/event.entity';

export const findClosestValue = (arr: number[], value: number) => {
  let curr = arr[0],
    diff = Math.abs(value - curr),
    index = 0;

  for (let val = 0; val < arr.length; val++) {
    const newdiff = Math.abs(value - arr[val]);
    if (newdiff < diff) {
      diff = newdiff;
      curr = arr[val];
      index = val;
    }
  }
  return index;
};

const getResultHandicap = (
  event: EventEntity,
  result1: number,
  result2: number,
) => {
  const { handicap } = JSON.parse(event.metadata || '{}') as {
    handicap: string[];
  };
  const totalResult1 = result1 + Number(handicap[0]);
  const totalResult2 = result2 + Number(handicap[1]);
  const result = totalResult1 - totalResult2;
  if (result >= 0.5) {
    return 0;
  } else if (result > 0) {
    return 1;
  } else if (result == 0) {
    return 2;
  } else if (result > -0.5) {
    return 3;
  } else {
    return 4;
  }
};

const getResultOverUnder = (event: EventEntity, totalScore: number) => {
  const options = JSON.parse(event.options) as string[];
  const optionsNum = options
    .filter((o, i) => i % 2 == 0)
    .map((o) => +o.replace('<', ''));
  const index = findClosestValue(optionsNum, totalScore);
  if (optionsNum[index] >= totalScore) {
    return index * 2;
  }
  return index * 2 + 1;
};

const getResultHomeDrawAway = (
  event: EventEntity,
  result1: number,
  result2: number,
) => {
  const options = JSON.parse(event.options) as string[];
  if (result1 > result2) {
    return 0;
  } else if (result1 == result2) {
    return 1;
  }
  return 2;
};

export async function getResult(
  event: EventEntity,
  scoreTeamOne: number,
  scoreTeamTwo: number,
) {
  let result = 0;
  if (event.pro == 1) {
    result =
      getResultOverUnder(event, Number(scoreTeamOne) + Number(scoreTeamTwo)) ||
      0;
  } else if (event.pro == 2) {
    result = getResultHandicap(
      event,
      Number(scoreTeamOne),
      Number(scoreTeamTwo),
    );
  } else if (event.pro == 3) {
    result = getResultHomeDrawAway(
      event,
      Number(scoreTeamOne),
      Number(scoreTeamTwo),
    );
  }
  return result;
}
