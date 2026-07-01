import Message from '../models/Message.js';
import User from '../models/User.js';
import Channel from '../models/Channel.js';

// Batch resolve display names for a list of from/to values
const batchResolveNames = async (values) => {
  const unique = [...new Set(values.filter(Boolean))];
  const objectIds = unique.filter(v => /^[a-f\d]{24}$/i.test(v));

  const users = objectIds.length
    ? await User.find({ _id: { $in: objectIds } })
        .select('_id firstName lastName username')
        .lean()
    : [];

  const userMap = {};
  users.forEach(u => {
    const full = [u.firstName, u.lastName].filter(Boolean).join(' ');
    userMap[String(u._id)] = full || u.username || 'User';
  });

  const resolve = (v) => {
    if (!v) return 'Unknown';
    if (v === 'admin') return 'Admin';
    if (v === 'all')   return 'Everyone';
    return userMap[v] || v;
  };

  return resolve;
};

// @desc    Get messages for a user (Admin, Manager, or Recruiter)
// @route   GET /api/messages
export const getMessages = async (req, res) => {
  try {
    const { role, username, _id } = req.user;
    const id = _id?.toString();
    let query;

    if (role === 'admin') {
      query = {
        $or: [
          { to: 'admin' },
          { from: 'admin' },
          { to: 'all' }
        ]
      };
    } else {
      query = {
        $or: [
          { to: id },
          { to: username },
          { to: 'all' },
          { from: id },
          { from: username }
        ]
      };
    }

    const messages = await Message.find(query).sort({ createdAt: -1 }).lean();

    const allValues = messages.flatMap(m => [m.from, m.to]);
    const resolve = await batchResolveNames(allValues);

    const enhancedMessages = messages.map(msg => ({
      ...msg,
      fromName: (msg.from === 'admin' && msg.senderName) ? msg.senderName : resolve(msg.from),
      toName:   resolve(msg.to),
    }));

    res.json(enhancedMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { to, subject, content } = req.body;
    const { role, _id, firstName, lastName, username } = req.user;
    const id = _id?.toString();

    const from = role === 'admin' ? 'admin' : id;
    const senderName = [firstName, lastName].filter(Boolean).join(' ') || username || 'Admin';

    const message = await Message.create({
      from,
      to,
      subject,
      content,
      senderId: _id,
      senderName
    });

    const resolve = await batchResolveNames([from, to]);
    res.status(201).json({ ...message.toObject(), fromName: resolve(from), toName: resolve(to) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a message (subject, content, and/or read status)
// @route   PUT /api/messages/:id
export const updateMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Allow the recipient to mark as read, or the sender/admin to edit content
    const userId = req.user._id?.toString();
    const isAdmin   = req.user.role === 'admin';
    const isSender  = message.from === userId || (isAdmin && message.from === 'admin');
    const isRecipient =
      message.to === userId ||
      message.to === req.user.username ||
      (isAdmin && (message.to === 'admin' || message.to === 'all'));

    const isChannelMessage = !!message.channelId;
    let isChannelMember = false;
    if (isChannelMessage) {
      const channel = await Channel.findById(message.channelId).lean();
      if (channel) {
        isChannelMember = channel.members.some(m => m.toString() === userId) || channel.type === 'public';
      }
    }

    if (!isAdmin && !isSender && !isRecipient && !isChannelMember) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Allow recipients to mark as read
    if (typeof req.body.read === 'boolean') {
      if (isRecipient) {
        message.read = req.body.read;
      }
      if (isChannelMessage && req.body.read === true) {
        if (!message.readBy.includes(req.user._id)) {
          message.readBy.push(req.user._id);
        }
      }
    }

    // Allow sender/admin to edit content fields
    if (isSender || isAdmin) {
      if (req.body.subject !== undefined) message.subject = req.body.subject || message.subject;
      if (req.body.content !== undefined) {
        // Enforce 15-minute edit window for non-admins
        if (!isAdmin) {
          const diffMinutes = (Date.now() - new Date(message.createdAt).getTime()) / 60000;
          if (diffMinutes > 15) {
            return res.status(400).json({ message: 'Messages can only be edited within 15 minutes of sending.' });
          }
        }
        message.content = req.body.content || message.content;
        message.edited = true;
      }
    }

    const updatedMessage = await message.save();
    res.json(updatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    const userId = req.user._id?.toString();
    if (req.user.role !== 'admin' && message.from !== userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();
    res.json({ id: message._id, deletedAt: message.deletedAt, content: message.content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};