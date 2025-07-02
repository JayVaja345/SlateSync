const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userdb = require("../Model/userSchema");
const documentdb = require("../Model/documentSchema");

exports.userpost = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json("Pls Fill All Fields");
  }

  try {
    const user = await userdb.findOne({ email: email });

    if (user) {
      return res.status(400).json("User already exists");
    } else {
      const hashPass = await bcrypt.hash(password, 10);
      const newUser = await userdb.create({
        name,
        email,
        password: hashPass,
      });

      const token = await jwt.sign(
        { _id: newUser._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      newUser.save();
      await res.status(200).json({ user: newUser, token });
    }
  } catch (error) {
    res.status(401).json(error);
    console.log("catch block error");
  }
};

exports.userget = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userdata = await userdb.findOne({ email: email });

    if (!userdata) {
      return res.status(400).json("Invalid Credentials");
    }

    const isMatch = await bcrypt.compare(password, userdata.password);

    if (!isMatch) {
      return res.status(400).json("Password Incorrect");
    }

    const token = jwt.sign({ _id: userdata._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    await res.status(200).json({ userdata, token });
  } catch (error) {
    res.status(400).json(error.message);
  }
};

exports.userdetails = async (req, res) => {
  try {
    // const token = req.token;
    const validuser = await userdb.findOne({ _id: req.userId });
    return res.status(200).json({ validuser });
  } catch (error) {
    res.status(400).json({ error: "Unable to fetch user details" });
  }
};

exports.createdocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    const newDoc = new documentdb({
      owner: req.userId,
      title: title || "Untitled Document",
      content: content || "",
      collaborators: [],
    });

    const savedDoc = await newDoc.save();

    // Properly populate the owner field before sending response
    const populatedDoc = await documentdb
      .findById(savedDoc._id)
      .populate({
        path: "owner",
        select: "name email", // Only include name and email fields
      })
      .lean(); // Convert to plain JavaScript object

    return res.status(200).json(populatedDoc);
  } catch (error) {
    console.error("Document creation error:", error);
    res.status(500).json({ error: "Document Creation Failed" });
  }
};

exports.getdocument = async (req, res) => {
  try {
    console.log("req.userId", req.userId); // in getdocument

    const docs = await documentdb
      .find({ owner: req.userId })
      .sort({ updatedAt: -1 });

    return res.status(200).json(docs);
  } catch (error) {
    res.status(500).json({ error: "Fetching documents failed" });
  }
};

// exports.getsingledocument = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const doc = await documentdb.findOne({
//       _id: id, //Specifies which document you're trying to open ( document ka id )
//       owner: req.userId, // Ensures the doc belongs to you, not someone else (user ka document hai ki nai)
//     });
//     console.log("GET SINGLE DOC: ", req.userId, req.params.id);

//     if (!doc) return res.status(404).json({ message: "Document not found" });

//     res.status(200).json(doc);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch document" });
//   }
// };

exports.getsingledocument = async (req, res) => {
  try {
    const doc = req.document; // 👈 Already populated and verified
    res.status(200).json(doc);
  } catch (error) {
    console.error("❌ Error in getsingledocument:", error);
    res.status(500).json({ error: "Failed to fetch document" });
  }
};

exports.updatedocument = async (req, res) => {
  try {
    const { title, content } = req.body;

    const updateDoc = await documentdb.findOneAndUpdate(
      { _id: req.params.id, owner: req.userId },
      { title, content, updatedAt: Date.now() },
      { new: true }
    );

    if (!updateDoc) {
      return res
        .status(404)
        .json({ message: "Document not found or not yours" });
    }

    res.status(200).json(updateDoc);
  } catch (error) {
    res.status(500).json({ error: "Failed to update document" });
  }
};

// exports.givingaccess = async (req, res) => {
//   try {
//     const doc = await documentdb.findById(req.params.id);

//     if (!doc) return res.status(404).json({ error: "Document not found" });

//     const ownerId = doc.owner?.toString();
//     const loggedInUserId = req.user?._id?.toString(); // ✅ Correct way

//     if (ownerId !== loggedInUserId) {
//       return res.status(403).json({ error: "You are not the owner" });
//     }

//     const { userId, access } = req.body;

//     if (userId === ownerId) {
//       return res.status(400).json({ error: "Owner already has full access" });
//     }

//     const alreadyExists = doc.collaborators.find(
//       (collab) => collab.user.toString() === userId
//     );

//     if (alreadyExists) {
//       return res
//         .status(400)
//         .json({ error: "User already added as collaborator" });
//     }

//     doc.collaborators.push({ user: userId, access: access || "viewer" });
//     await doc.save();

//     res.status(200).json({ message: "Shared successfully", document: doc });
//   } catch (error) {
//     console.error("Sharing error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

exports.givingaccess = async (req, res) => {
  try {
    const doc = await documentdb.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Safely get owner ID
    const ownerId = doc.owner?.toString();
    const loggedInUserId = req.user?._id?.toString();

    // Verify ownership
    if (!ownerId || !loggedInUserId || ownerId !== loggedInUserId) {
      return res.status(403).json({ error: "You are not the owner" });
    }

    // Validate request body
    const { email, access = "viewer" } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find user to share with
    const userToShare = await userdb.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ error: "User not found" });
    }

    const userIdToShare = userToShare._id.toString();

    // Prevent sharing with owner
    if (userIdToShare === ownerId) {
      return res.status(400).json({ error: "Owner already has full access" });
    }

    // Check if already a collaborator
    const alreadyExists = doc.collaborators.some(
      (collab) => collab.user?.toString() === userIdToShare
    );

    if (alreadyExists) {
      return res.status(400).json({
        error: "User already has access",
        currentAccess: doc.collaborators.find(
          (c) => c.user?.toString() === userIdToShare
        )?.access,
      });
    }

    // Add collaborator
    doc.collaborators.push({
      user: userToShare._id,
      access,
    });

    await doc.save();

    // Return populated document
    const populatedDoc = await documentdb
      .findById(doc._id)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email");

    res.status(200).json({
      message: "Shared successfully",
      document: populatedDoc,
    });
  } catch (error) {
    console.error("Sharing error:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.havingaccess = async (req, res) => {
  console.log("🚀 havingaccess controller triggered");
  try {
    const userId = req.userId;
    console.log("🔍 Searching for documents where:");
    console.log("- Owner is:", userId);
    console.log("- OR user is in collaborators");

    const query = {
      $or: [{ owner: userId }, { "collaborators.user": userId }],
    };
    console.log("MongoDB Query:", JSON.stringify(query, null, 2));

    const docs = await documentdb
      .find(query)
      .populate("owner", "name email")
      .populate("collaborators.user", "name email")
      .lean();

    console.log(`📄 Found ${docs.length} documents`);

    if (docs.length > 0) {
      console.log("Sample document:", {
        _id: docs[0]._id,
        title: docs[0].title,
        owner: docs[0].owner,
        collaborators: docs[0].collaborators,
      });
    }

    res.status(200).json(docs);
  } catch (error) {
    console.error("❌ Error in havingaccess:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};
