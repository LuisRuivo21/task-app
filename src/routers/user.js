const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const auth = require("../middleware/authentication");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancellationEmail } = require("../emails/account");

// 1. Create REST API Resource - Users route for Sign in / Create Account
router.post("/users", async (request, response) => {
  const user = new User(request.body); //request.body is the object which contains the properties we trying to set up

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    response.status(201).send({
      user,
      token,
    });
  } catch (error) {
    response.status(400).send(error);
  }
});

// 2. Create REST API Resource - Users route for Login
router.post("/users/login", async (request, response) => {
  try {
    const user = await User.findByCredentials(request.body.email, request.body.password);
    const token = await user.generateAuthToken();
    response.send({
      user,
      token,
    });
  } catch (error) {
    response.status(400).send();
  }
});

// 3. Create REST API Resource - Users route for Log out from one session
router.post("/users/logout", auth, async (request, response) => {
  try {
    request.user.tokens = request.user.tokens.filter((token) => {
      return token.token !== request.token;
    });

    await request.user.save();

    response.send();
  } catch (error) {
    response.status(500).send();
  }
});

// 3.1 Create REST API Resource - Users route for Log out of all sessions
router.post("/users/logoutAll", auth, async (request, response) => {
  try {
    request.user.tokens = [];
    await request.user.save();
    response.send();
  } catch (error) {
    response.status(500).send();
  }
});

// 4. Retrieve REST API Resource - Profile Users route
router.get("/users/me", auth, async (request, response) => {
  response.send(request.user);
});

// 5. Update REST API Resource - Update User Profile route
router.patch("/users/me", auth, async (request, response) => {
  const updates = Object.keys(request.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return response.status(400).send({
      error: "Invalid Update!",
    });
  }

  try {
    updates.forEach((update) => (request.user[update] = request.body[update]));
    await request.user.save();
    response.send(request.user);
  } catch (error) {
    response.status(400).send(error);
  }
});

// 6. Delete REST API Resource - Delete User route
router.delete("/users/me", auth, async (request, response) => {
  try {
    await request.user.deleteOne();
    sendCancellationEmail(request.user.email, request.user.name);
    response.send(request.user);
  } catch (error) {
    response.status(500).send();
  }
});

// 7. Create REST API Resource - Add Avatar route to upload profile picture
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(request, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error("Please upload a jpg, jpeg or png file."));
    }

    callback(undefined, true);
  },
});

// prettier-ignore
router.post("/users/me/avatar", auth, upload.single("avatar"), async (request, response) => {
  const buffer = await sharp(request.file.buffer).resize({width:250, height:250}).png().toBuffer();
  request.user.avatar = buffer;
  await request.user.save();
  response.send();
  },
  (error, request, response, next) => {
    response.status(400).send({
      error: error.message,
    });
  }
);

// 8. Delete REST API Resource - Delete Avatar route to delete profile picture
router.delete("/users/me/avatar", auth, async (request, response) => {
  request.user.avatar = undefined;
  await request.user.save();
  response.send();
});

//9. Retrieve REST API Resource - Retrieve Avatar route to upload profile picture bu URL
router.get("/users/:id/avatar", async (request, response) => {
  try {
    const user = await User.findById(request.params.id);

    if (!user || !user.avatar) {
      throw new Error("No avatar found.");
    }

    response.set("Content-Type", "image/jpg");
    response.send(user.avatar);
  } catch (error) {
    response.status(404).send();
  }
});

module.exports = router;
