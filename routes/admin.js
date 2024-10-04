const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");

router.get('/', adminController.showAdminView);
router.delete('/:type/:id', adminController.deleteItem);
module.exports = router;