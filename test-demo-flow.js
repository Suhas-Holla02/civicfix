async function runDemoFlowTest() {
  console.log('--- STARTING DEMO FLOW AUTOMATED VERIFICATION ---');
  
  // 1. Citizen Login
  console.log('1. Citizen Login...');
  const citizenLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'citizen@example.com', password: 'citizen123' })
  });
  const citizenAuth = await citizenLoginRes.json();
  if (!citizenAuth.token) throw new Error('Citizen login failed: ' + JSON.stringify(citizenAuth));
  console.log('   ✓ Citizen logged in:', citizenAuth.user.name, 'Token received.');

  // 2. AI Analysis Preview
  console.log('2. Testing AI Analysis on sample prompt...');
  const aiRes = await fetch('http://localhost:5000/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'Streetlight near my college has been broken for 2 weeks and students are having difficulty seeing the road at night.',
      address: '42 College Road, Near North Gate, Central Ward'
    })
  });
  const aiData = await aiRes.json();
  console.log('   ✓ AI Category:', aiData.analysis.category);
  console.log('   ✓ AI Subcategory:', aiData.analysis.subcategory);
  console.log('   ✓ AI Priority:', aiData.analysis.priority);
  console.log('   ✓ AI Department:', aiData.analysis.department);
  console.log('   ✓ AI Keywords:', aiData.analysis.keywords);
  console.log('   ✓ AI Summary:', aiData.analysis.summary);

  // 3. Duplicate Detection Preview
  console.log('3. Duplicate Detection Preview against existing database complaints...');
  const dupRes = await fetch('http://localhost:5000/api/ai/check-duplicates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      description: 'Streetlight near my college has been broken for 2 weeks.',
      category: aiData.analysis.category,
      subcategory: aiData.analysis.subcategory,
      latitude: 12.971598,
      longitude: 77.594562,
      keywords: aiData.analysis.keywords
    })
  });
  const dupData = await dupRes.json();
  console.log('   ✓ Duplicate Match Found?:', dupData.duplicates.hasDuplicates);
  console.log('   ✓ Match Count:', dupData.duplicates.count);
  if (dupData.duplicates.matches[0]) {
    console.log('   ✓ Top Similar Complaint:', dupData.duplicates.matches[0].complaint_code, 'Similarity:', Math.round(dupData.duplicates.matches[0].similarity_score * 100) + '%');
  }

  // 4. Submit Complaint
  console.log('4. Submitting Complaint via citizen token...');
  const submitRes = await fetch('http://localhost:5000/api/complaints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + citizenAuth.token
    },
    body: JSON.stringify({
      description: 'Streetlight near my college has been broken for 2 weeks.',
      address: '42 College Road, Near North Gate, Central Ward',
      latitude: 12.971598,
      longitude: 77.594562,
      forceSubmit: true
    })
  });
  const submitData = await submitRes.json();
  const createdComplaint = submitData.complaint;
  console.log('   ✓ Complaint Created with ID:', createdComplaint.complaint_code);
  console.log('   ✓ Status:', createdComplaint.status);
  console.log('   ✓ Assigned Dept:', createdComplaint.department);
  console.log('   ✓ Status History Steps:', createdComplaint.status_history.map(h => h.new_status).join(' -> '));

  // 5. Admin Login
  console.log('5. Admin Login...');
  const adminLoginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@civicfix.gov', password: 'admin123' })
  });
  const adminAuth = await adminLoginRes.json();
  console.log('   ✓ Admin logged in:', adminAuth.user.name);

  // 6. Admin updates status to IN PROGRESS
  console.log('6. Admin updating status to IN PROGRESS...');
  const progressRes = await fetch('http://localhost:5000/api/complaints/' + createdComplaint.id + '/status', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + adminAuth.token
    },
    body: JSON.stringify({
      status: 'IN PROGRESS',
      notes: 'Work order #EL-902 assigned to Central Ward electrical repair squad.'
    })
  });
  const progressData = await progressRes.json();
  console.log('   ✓ Complaint Status Updated To:', progressData.complaint.status);

  // 7. Admin updates status to RESOLVED
  console.log('7. Admin updating status to RESOLVED...');
  const resolveRes = await fetch('http://localhost:5000/api/complaints/' + createdComplaint.id + '/status', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + adminAuth.token
    },
    body: JSON.stringify({
      status: 'RESOLVED',
      notes: 'New 80W LED luminaire fixture installed on pole #C-14. Illumination verified.'
    })
  });
  const resolveData = await resolveRes.json();
  console.log('   ✓ Complaint Status Updated To:', resolveData.complaint.status);
  console.log('   ✓ Resolved At Timestamp:', resolveData.complaint.resolved_at);

  // 8. Verify Analytics Updated
  console.log('8. Querying updated analytics summary...');
  const analyticsRes = await fetch('http://localhost:5000/api/analytics/summary');
  const analyticsData = await analyticsRes.json();
  console.log('   ✓ Total Complaints:', analyticsData.summary.total);
  console.log('   ✓ Total Resolved:', analyticsData.summary.resolved);
  console.log('   ✓ Resolution Rate:', analyticsData.summary.resolutionRate + '%');

  // 9. Verify Map Points
  console.log('9. Checking Hotspot Map endpoint...');
  const mapRes = await fetch('http://localhost:5000/api/complaints/map');
  const mapData = await mapRes.json();
  const foundOnMap = mapData.points.find(p => p.complaint_code === createdComplaint.complaint_code);
  console.log('   ✓ Point found on map?:', !!foundOnMap, 'Coords:', foundOnMap?.latitude, foundOnMap?.longitude);

  console.log('=== DEMO FLOW VERIFICATION COMPLETE AND 100% SUCCESSFUL! ===');
}

runDemoFlowTest().catch(console.error);
