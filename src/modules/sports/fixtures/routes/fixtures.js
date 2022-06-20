import fixturesController from 'src/modules/v1/fixtures/controllers/fixtures';
import express from 'express';

const router = express.Router();

router.get('/', fixturesController.list);

router.get('/hot', fixturesController.hot);

router.get('/trigger-crontab', fixturesController.triggerCrontab);

router.get('/sponsor', fixturesController.sponsorList);

router.get('/sponsor/hot', fixturesController.sponsorHot);

router.put('/:id', fixturesController.update);

// router.put('/sponsor/:id', fixturesController.sponsorUpdate);

export default router;
