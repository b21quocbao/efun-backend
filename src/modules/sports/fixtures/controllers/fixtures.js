import helper from 'src/common/helper';
import blockchain from 'src/common/blockchain';
import _ from 'lodash';
import queryFilter from 'src/common/filter-query';
import fixturesRepository from 'src/modules/v1/fixtures/repositories/fixtures';
import sponsorFixturesRepository from 'src/modules/v1/fixtures/repositories/sponsorFixtures';
import crontabCountry from 'src/modules/v1/countries/crontab';
import crontabFixture from 'src/modules/v1/fixtures/crontab';
import crontabLeague from 'src/modules/v1/leagues/crontab';
import crontabRound from 'src/modules/v1/rounds/crontab';
import crontabSeason from 'src/modules/v1/seasons/crontab';
import crontabTeam from 'src/modules/v1/teams/crontab';
import crontabP2P from 'src/modules/v1/p2p/crontab';
import crontabGroup from 'src/modules/v1/groups/crontab';
import leaguesRepository from 'src/modules/v1/leagues/repositories/leagues';
import models from 'src/database/Initialize';
import config from 'src/config/config';

const controller = {};

/**
 * List all record of the model by paginate
 * @param {*} req
 * @param {*} res
 */
controller.list = async (req, res) => {
  try {
    const fixturesModel = new fixturesRepository(req, res);
    const queryOptions = queryFilter(req.query);
    const attrs = [];
    const options = [0, 1, 2];

    for (const token of config.tokens) {
      attrs.push([
        models.Sequelize.literal(
          '(SELECT COALESCE(SUM("group_predicts"."amount"), 0) FROM "group_predicts" WHERE "group_predicts"."fixtureId" = "Fixtures"."id" AND "group_predicts"."token" = \'' +
            token.address +
            "')",
        ),
        'group_predict_' + token.symbol + 'Amount',
      ]);

      for (const option of options) {
        attrs.push([
          models.Sequelize.literal(
            '(SELECT COALESCE(SUM("group_predicts"."amount"), 0) FROM "group_predicts" WHERE "group_predicts"."fixtureId" = "Fixtures"."id" AND "group_predicts"."option" = ' +
              option +
              ' AND "group_predicts"."token" = \'' +
              token.address +
              "')",
          ),
          'group_predict_' + token.symbol + 'Option_' + option,
        ]);
      }
    }

    queryOptions.attributes = Object.assign({}, queryOptions.attributes, {
      include: attrs,
    });

    if (typeof queryOptions.order == 'undefined') {
      queryOptions.order = Object.assign([], queryOptions.order, [
        ['date', 'ASC'],
      ]);
    } else {
      queryOptions.order.push(['date', 'ASC']);
    }

    const fixtures = await fixturesModel.paginate(queryOptions);

    return res.json(helper.formatOutputData(fixtures, 'fixtures.list.success'));
  } catch (err) {
    return res.status(400).json(helper.displayErrorMessage(err));
  }
};

/**
 * List all record of the model by paginate
 * @param {*} req
 * @param {*} res
 */
controller.hot = async (req, res) => {
  try {
    const fixturesModel = new fixturesRepository(req, res);
    const queryOptions = queryFilter(req.query);
    const attrs = [];
    const options = [0, 1, 2];

    for (const token of config.tokens) {
      attrs.push([
        models.Sequelize.literal(
          '(SELECT COALESCE(SUM("group_predicts"."amount"), 0) FROM "group_predicts" WHERE "group_predicts"."fixtureId" = "Fixtures"."id" AND "group_predicts"."token" = \'' +
            token.address +
            "')",
        ),
        'group_predict_' + token.symbol + 'Amount',
      ]);

      for (const option of options) {
        attrs.push([
          models.Sequelize.literal(
            '(SELECT COALESCE(SUM("group_predicts"."amount"), 0) FROM "group_predicts" WHERE "group_predicts"."fixtureId" = "Fixtures"."id" AND "group_predicts"."option" = ' +
              option +
              ' AND "group_predicts"."token" = \'' +
              token.address +
              "')",
          ),
          'group_predict_' + token.symbol + 'Option_' + option,
        ]);
      }
    }

    queryOptions.attributes = Object.assign({}, queryOptions.attributes, {
      include: attrs,
    });

    queryOptions.where = Object.assign({}, queryOptions.where, {
      hot: true,
    });

    if (typeof queryOptions.order == 'undefined') {
      queryOptions.order = Object.assign([], queryOptions.order, [
        ['timestamp', 'ASC'],
      ]);
    } else {
      queryOptions.order.push(['timestamp', 'ASC']);
    }

    const fixtures = await fixturesModel.findAll(queryOptions);

    return res.json(helper.formatOutputData(fixtures, 'fixtures.list.success'));
  } catch (err) {
    return res.status(400).json(helper.displayErrorMessage(err));
  }
};

controller.triggerCrontab = async (req, res) => {
  try {
    if (req.query.type) {
      if (req.query.type == 'countrySchedule') {
        await crontabCountry.countrySchedule();
      } else if (req.query.type == 'seasonSchedule') {
        await crontabSeason.seasonSchedule();
      } else if (req.query.type == 'teamSchedule') {
        await crontabTeam.teamSchedule();
      } else if (req.query.type == 'leagueSchedule') {
        await crontabLeague.leagueSchedule();
      } else if (req.query.type == 'roundSchedule') {
        await crontabRound.roundSchedule();
      } else if (req.query.type == 'fixtureSchedule') {
        await crontabFixture.fixtureSchedule();
      } else if (req.query.type == 'bc') {
        if (req.query.subType == 'reMatch') {
          const fixturesModel = new fixturesRepository(req, res);
          const fixture = await fixturesModel.findOne({
            where: {
              id: req.query.fixtureId,
            },
          });

          if (fixture) {
            await crontabFixture.autoCreateMatchBC(fixture.id);
          }
        }

        if (req.query.subType == 'matchInfo') {
          const initWeb3Contract = blockchain.initWeb3Contract();
          const info = await initWeb3Contract.contract.methods
            .info(parseInt(req.query.matchId))
            .call();
          console.log(initWeb3Contract.web3.utils.hexToAscii(info.description));
        }

        if (req.query.subType == 'leagues') {
          const leaguesModel = new leaguesRepository();
          await leaguesModel.update(
            {
              order: req.query.order,
            },
            {
              where: {
                id: req.query.id,
              },
            },
          );
        }

        // const fixturesModel = new fixturesRepository(req, res);
        // const fixtures = await fixturesModel.findAll({
        //     where: {
        //         bcMatchId: null,
        //         leagueId: 9
        //     }
        // });

        // if(fixtures.total > 0) {
        //     for (const fixture of fixtures.items) {
        //         if(crontabFixture.checkCondTriggerCreateMatch(fixture) == true) {
        //             await crontabFixture.autoCreateMatchBC(fixture.id, fixture.id, fixture.timestamp);
        //         }
        //     }
        // }

        // await crontabGroup.groupPredicts();
        // const initWeb3Contract = blockchain.initWeb3Contract('group');
        // const transaction = await initWeb3Contract.web3.eth.getTransactionReceipt('0x5254ca1481c7fea270cd45b1b71d7fd8e6c99c54f0cf193dbab6a820ae2ece12');
        // const block = await initWeb3Contract.web3.eth.getBlock(transaction.blockNumber);
        // console.log(block.timestamp, transaction.blockNumber);
        // const fixtures = [];

        // for (const fixtureId of fixtures) {
        //     const fixturesModel = new fixturesRepository(req, res);
        //     const fixture = await fixturesModel.findById(fixtureId);
        //     await crontabFixture.autoCreateMatchBC(fixture.id, fixture.id, fixture.timestamp);
        // }

        //await crontabFixture.autoCreateMatchBC(req.query.fixtureId, req.query.fixtureId, req.query.timestamp);

        // const initWeb3Contract = blockchain.initWeb3Contract('p2p');
        // const bcFilter = {fromBlock: 0, toBlock: 'latest'};
        // const events = await initWeb3Contract.contract.getPastEvents('allEvents', bcFilter);
        // const initWeb3Contract = blockchain.initWeb3Contract('match');
        // const query = initWeb3Contract.contract.methods.updateMatchScores([req.query.bcMatchId],[req.query.goalHome],[req.query.goalAway]);
        // const query = initWeb3Contract.contract.methods.updateMatchStatuses([req.query.bcMatchId],[2]);
        // await blockchain.sendMethod(query, initWeb3Contract.web3, initWeb3Contract.contract, initWeb3Contract.account);

        // const initWeb3Contract = blockchain.initWeb3Contract('match');

        // // Send function updateMatchScores on Blockchain
        // const queryUpdateMatchScores = initWeb3Contract.contract.methods.updateMatchScores([30],[1],[2]);
        // await blockchain.sendMethod(queryUpdateMatchScores, initWeb3Contract.web3, initWeb3Contract.contract, initWeb3Contract.account);

        // // Send function updateMatchStatuses on Blockchain
        // // {NOT_EXISTED, AVAILABLE, FINISH, CANCEL, SUSPEND}
        // const queryUpdateMatchStatuses = initWeb3Contract.contract.methods.updateMatchStatuses([30],[2]);
        // await blockchain.sendMethod(queryUpdateMatchStatuses, initWeb3Contract.web3, initWeb3Contract.contract, initWeb3Contract.account);
      }
    }

    return res.json(helper.formatOutputData([], 'fixtures.list.success'));
  } catch (err) {
    return res.status(400).json(helper.displayErrorMessage(err));
  }
};

/**
 * Update a record
 * @param {*} req
 * @param {*} res
 */
controller.update = async (req, res) => {
  try {
    const fixturesModel = new fixturesRepository(req, res);
    const options = {};
    options.where = { id: req.params.id || 0 };
    const fixture = await fixturesModel.update(req.body, options);

    return res.json(
      helper.formatOutputData(fixture, 'fixtures.update.success'),
    );
  } catch (err) {
    return res.status(400).json(helper.displayErrorMessage(err));
  }
};

controller.sponsorList = async (req, res) => {
  try {
    const fixturesModel = new sponsorFixturesRepository(req, res);
    const queryOptions = queryFilter(req.query);

    queryOptions.order = Object.assign([], queryOptions.order, [
      ['date', 'ASC'],
    ]);

    const fixtures = await fixturesModel.paginate(queryOptions);

    return res.json(helper.formatOutputData(fixtures, 'fixtures.list.success'));
  } catch (err) {
    return res.status(400).json(helper.displayErrorMessage(err));
  }
};

controller.sponsorHot = async (req, res) => {
  try {
    const fixturesModel = new sponsorFixturesRepository(req, res);
    const fixtures = await fixturesModel.findAll({
      where: {
        hot: true,
      },
      order: [['timestamp', 'ASC']],
    });

    return res.json(helper.formatOutputData(fixtures, 'fixtures.list.success'));
  } catch (err) {
    return res.status(400).json(helper.displayErrorMessage(err));
  }
};

controller.sponsorUpdate = async (req, res) => {
  try {
    const fixturesModel = new sponsorFixturesRepository(req, res);
    const options = {};
    options.where = { id: req.params.id || 0 };
    const fixture = await fixturesModel.update(req.body, options);

    return res.json(
      helper.formatOutputData(fixture, 'fixtures.update.success'),
    );
  } catch (err) {
    return res.status(400).json(helper.displayErrorMessage(err));
  }
};

export default controller;
