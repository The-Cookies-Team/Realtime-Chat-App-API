import ConversationMember from "../models/conversationMemberModel.js";
import Conversation from "../models/conversationModel.js";
import Friendship from "../models/friendshipModel.js";
import Notification from "../models/notificationModel.js";
import {
  getPaginatedData,
  makeErrorResponse,
  makeSuccessResponse,
} from "../services/apiService.js";

const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const { user } = req;
    const checkExistedFriendship = await Friendship.find({
      $or: [
        { sender: user._id, receiver: receiverId },
        { sender: receiverId, receiver: user._id },
      ],
    });
    if (checkExistedFriendship.length > 0) {
      return makeErrorResponse({
        res,
        message: "Friend request already sent or received",
      });
    }
    const friendship = await Friendship.create({
      sender: user._id,
      receiver: receiverId,
      status: 1, // pending
    });
    await Notification.create({
      user: receiverId,
      message: `${user.displayName} đã gửi lời mời kết bạn`,
    });
    return makeSuccessResponse({
      res,
      message: "Friend request sent",
      data: friendship,
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const friendship = await Friendship.findByIdAndUpdate(
      friendshipId,
      { status: 2 }, // accepted
      { new: true }
    ).populate("sender receiver");
    await Notification.create({
      user: friendship.receiver._id,
      message: `${friendship.receiver.displayName} đã chấp nhận lời mời kết bạn`,
    });
    await Conversation.create({ friendship });
    return makeSuccessResponse({
      res,
      message: "Friend request accepted",
      data: friendship,
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const rejectFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const friendship = await Friendship.findById(friendshipId).populate(
      "receiver"
    );
    await Notification.create({
      user: friendship.receiver._id,
      message: `${friendship.receiver.displayName} đã từ chối lời mời kết bạn`,
    });
    await friendship.deleteOne();
    return makeSuccessResponse({
      res,
      message: "Friend request rejected",
      data: friendship,
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const deleteFriendRequest = async (req, res) => {
  try {
    const { friendshipId } = req.params;
    const friendship = await Friendship.findById(friendshipId).populate(
      "sender receiver"
    );
    if (!friendship) {
      return makeErrorResponse({
        res,
        message: "Friendship not found",
      });
    }
    await friendship.deleteOne();
    return makeSuccessResponse({
      res,
      message: "Friend request deleted",
      data: friendship,
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

const getListFriendships = async (req, res) => {
  try {
    const result = await getPaginatedData({
      model: Friendship,
      req,
      populateOptions: [
        { path: "sender", populate: { path: "role", select: "-permissions" } },
        {
          path: "receiver",
          populate: { path: "role", select: "-permissions" },
        },
      ],
    });
    return makeSuccessResponse({
      res,
      data: result,
    });
  } catch (error) {
    return makeErrorResponse({ res, message: error.message });
  }
};

export {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getListFriendships,
  deleteFriendRequest,
};
