import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Candidate from '../models/Candidate.js';

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

async function run() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to DB');
  
  const allCandidates = await Candidate.find({}).lean();
  console.log(`Total Candidates: ${allCandidates.length}`);
  
  const joinedCandidates = allCandidates.filter(c => {
    const statusVal = Array.isArray(c.status) ? c.status.join(', ') : String(c.status);
    return statusVal.toLowerCase().includes('joined');
  });
  
  console.log(`Joined Candidates: ${joinedCandidates.length}`);
  joinedCandidates.forEach(c => {
    console.log(`- ID: ${c._id}, Name: ${c.firstName} ${c.lastName}, Status: ${JSON.stringify(c.status)}, Client: ${c.client}`);
  });
  
  process.exit(0);
}

run().catch(console.error);
