// documentAccess.js middleware
const documentdb = require("../Model/documentSchema");

const verifyDocumentAccess = async (req, res, next) => {
  try {
    const doc = await documentdb
      .findById(req.params.id)
      .populate("owner")
      .populate("collaborators.user");

    if (!doc) return res.status(404).json({ error: "Document not found" });

    const userId = req.userId;
    const isOwner = doc.owner._id.toString() === userId.toString();
    const isCollaborator = doc.collaborators.some(
      (c) => c.user._id.toString() === userId.toString()
    );

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ error: "No access to this document" });
    }

    req.document = doc;

    req.accessLevel = isOwner
      ? "owner"
      : doc.collaborators.find(
          (c) => c.user._id.toString() === userId.toString()
        ).access;

    next();
  } catch (error) {
    res.status(500).json({ error: "Access verification failed" });
  }
};

module.exports = verifyDocumentAccess;
