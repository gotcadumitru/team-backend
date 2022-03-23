const Other = require("../models/other.model");
const router = require("express").Router();

router.get('/', async (req, res) => {

    try {
        const findOther = await Other.find();

        res.status(200).json({
            succes: true,
            other: [...findOther]

        })
    } catch (err) {

        console.log(err)
        res.status(400).json({
            succes: false,
            error: "Not authorized"
        })

    }
});


module.exports = router;