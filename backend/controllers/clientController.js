import Client from '../models/Client.js';
import { getAgreementDB, connectAgreementDB } from '../config/agreementDatabase.js';
import CandidateSubmission from '../models/CandidateSubmission.js';

const getDBInstance = async () => {
  try {
    return getAgreementDB();
  } catch {
    return await connectAgreementDB();
  }
};

// @desc    Get all clients
// @route   GET /api/clients
export const getClients = async (req, res) => {
  try {
    const clientQuery = Client.find({}).sort({ createdAt: -1 });
    if (req.query.view === 'lookup') {
      clientQuery.select('_id clientId companyName active');
    }
    const clients = await clientQuery.lean();

    // Get submission counts for each client
    if (req.query.view !== 'lookup') {
      try {
        const counts = await CandidateSubmission.aggregate([
          {
            $group: {
              _id: { $toLower: { $trim: { input: "$clientName" } } },
              count: { $sum: 1 }
            }
          }
        ]);

        const countMap = {};
        counts.forEach(item => {
          if (item._id) {
            countMap[item._id] = item.count;
          }
        });

        clients.forEach(client => {
          const key = String(client.companyName || '').trim().toLowerCase();
          client.submissionCount = countMap[key] || 0;
        });
      } catch (e) {
        console.error('Failed to aggregate candidate submissions:', e.message);
      }
    }

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create client
// @route   POST /api/clients
export const createClient = async (req, res) => {
  try {
    const { clientId } = req.body;

    // Auto-generate ID if not provided
    let finalClientId = clientId;
    if (!finalClientId) {
      const count = await Client.countDocuments();
      finalClientId = `CL${(1000 + count + 1)}`;
    }

    const client = await Client.create({
      ...req.body,
      clientId: finalClientId
    });

    // Synchronize to Agreement Database's companies collection
    try {
      const db = await getDBInstance();
      if (db) {
        const lockingDays = client.lockingPeriod || '0';
        const percentage = client.percentage || 0;
        await db.collection('companies').insertOne({
          name: client.companyName || '',
          email: client.email || '',
          compensation: { percentage: parseFloat(percentage) },
          address: client.address || client.clientLocation || '',
          replacement: client.replacementPeriod || '',
          payment_release: client.paymentMode || '',
          invoice_post_joining: `${lockingDays}:0:0`,
          status: 'Pending',
          created_at: new Date(),
          emp_id: `EMP${String(Math.floor(Math.random() * 900) + 100)}`
        });
      }
    } catch (e) {
      console.error('Failed to sync client creation to Agreement DB:', e.message);
    }

    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// export const updateClient = async (req, res) => {
//   ... (already defined on line 76)
// }
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Store old info to match in Agreement DB
    const oldName = client.companyName;
    const oldEmail = client.email;

    const updatedClient = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Synchronize update to Agreement Database's companies collection
    try {
      const db = await getDBInstance();
      if (db) {
        const lockingDays = updatedClient.lockingPeriod || '0';
        const percentage = updatedClient.percentage || 0;

        await db.collection('companies').updateOne(
          { $or: [{ email: oldEmail }, { name: oldName }] },
          {
            $set: {
              name: updatedClient.companyName || '',
              email: updatedClient.email || '',
              compensation: { percentage: parseFloat(percentage) },
              address: updatedClient.address || updatedClient.clientLocation || '',
              replacement: updatedClient.replacementPeriod || '',
              payment_release: updatedClient.paymentMode || '',
              invoice_post_joining: `${lockingDays}:0:0`
            }
          },
          { upsert: false }
        );
      }
    } catch (e) {
      console.error('Failed to sync client update to Agreement DB:', e.message);
    }

    res.json(updatedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Synchronize delete to Agreement DB
    try {
      const db = await getDBInstance();
      if (db) {
        await db.collection('companies').deleteOne({
          $or: [{ email: client.email }, { name: client.companyName }]
        });
      }
    } catch (e) {
      console.error('Failed to sync client deletion to Agreement DB:', e.message);
    }

    await client.deleteOne();
    res.json({ message: 'Client removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
