const POST_STATUS = {
  NOU: 'Nou',
  IN_PREGRES: 'In progres',
  IN_DISCUTIE: 'In discutie',
  FINISAT: 'Finisat',
  BLOCAT: 'Blocat',
}
const POST_STATUS_ARRAY = [
  {
    id: POST_STATUS.NOU,
    name: POST_STATUS.NOU
  },
  {
    id: POST_STATUS.IN_PREGRES,
    name: POST_STATUS.IN_PREGRES
  },
  {
    id: POST_STATUS.IN_DISCUTIE,
    name: POST_STATUS.IN_DISCUTIE
  },
  {
    id: POST_STATUS.FINISAT,
    name: POST_STATUS.FINISAT
  },
  {
    id: POST_STATUS.BLOCAT,
    name: POST_STATUS.BLOCAT
  },
]
const POSTS_KANBANBOARD = "POSTS_KANBANBOARD"
module.exports = { POST_STATUS, POST_STATUS_ARRAY, POSTS_KANBANBOARD }