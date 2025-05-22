// backend/controllers/reviewController.js
const Review = require('../models/Review');

exports.getUnapproved = async (req, res) => {
  try {
    const list = await Review.find({ approved: false })
      .populate('user', 'username')
      .populate('product', 'name');
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

exports.approveReview = async (req, res) => {
  try {
    const rev = await Review.findById(req.params.id);
    if (!rev) return res.status(404).json({ message: 'Review not found' });
    rev.approved = true;
    await rev.save();
    res.json(rev);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error approving review' });
  }
};
