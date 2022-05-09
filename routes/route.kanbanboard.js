const Post = require("../models/model.post");
const Kanbanboard = require("../models/model.kanbanboard");
const checkToken = require("./verifyToken");
const router = require("express").Router();
const { POST_STATUS_ARRAY, POSTS_KANBANBOARD } = require("../defaults/default.post-status");

router.get("/board", checkToken, async (req, res) => {
  try {

    let board = await Kanbanboard.findOne({ boardName: POSTS_KANBANBOARD })
    let posts = await Post.find();
    if (!board) {
      board = new Kanbanboard({
        boardName: POSTS_KANBANBOARD,
        columns: POST_STATUS_ARRAY.map((status) => {
          return {
            id: status.id,
            title: status.name,
            items: posts
              .filter((post) => post.status === status.name)
              .map((post) => post._id),
          };
        }),
      });
      await board.save()
    }
    return res.status(200).send({
      board,
    });
  } catch (error) {
    console.log(error)
    res.status(400).send({
      message: "Ceva nu a mers bine",
      succes: false,
    });
  }
});
router.put("/board", checkToken, async (req, res) => {
  try {
    const boardFromFE = req.body.board;
    console.log(boardFromFE)
    const board = await Kanbanboard.findOne({ boardName: POSTS_KANBANBOARD })
    board.columns = boardFromFE.columns
    await board.save()
    const io = req.app.get('socketio');
    io.emit('getBoard', board)
    return res.status(200).send({
      board,
    });
  } catch (error) {
    console.log(error)
    res.status(400).send({
      message: "Ceva nu a mers bine",
      succes: false,
    });
  }
});

module.exports = router;
