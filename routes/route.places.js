const {oraseRomania,oraseComuneRomania} = require("../defaults/default.places");

const router = require("express").Router();
router.get("/judete", async (req, res) => {
  try {

    return res.status(200).send(
        oraseRomania
    );
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
    });
  }
});
router.get("/orase/:countryName", async (req, res) => {
  try {
    const { countryName } = req.params;
    return res.status(200).send(
        oraseComuneRomania.filter(oras=>oras.country.toLowerCase() === countryName.toLowerCase())
    );
  } catch (error) {
    console.log(error);
    res.status(400).send({
      message: "Ceva nu a mers bine",
      success: false,
    });
  }
});

module.exports = router;
