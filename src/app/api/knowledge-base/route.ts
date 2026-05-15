import { NextRequest, NextResponse } from "next/server";

interface MeetingRecord {
  id: string;
  title: string;
  date: string;
  participants: string[];
  report: string;
  decisions: string[];
  actionItems: Array<{
    task: string;
    owner: string;
    deadline: string;
  }>;
  createdAt: string;
}

// In-memory storage (in production, use a real database like PostgreSQL or MongoDB)
let knowledgeBase: MeetingRecord[] = [];

export async function POST(req: NextRequest) {
  const { action, meetingData, query } = await req.json();

  if (action === "store") {
    // Store a new meeting record
    const record: MeetingRecord = {
      id: `meeting-${Date.now()}`,
      title: meetingData.title || "Meeting",
      date: new Date().toISOString(),
      participants: meetingData.participants || [],
      report: meetingData.report || "",
      decisions: meetingData.decisions || [],
      actionItems: meetingData.actionItems || [],
      createdAt: new Date().toISOString(),
    };
    knowledgeBase.push(record);
    return NextResponse.json({ success: true, record });
  }

  if (action === "search") {
    // Search the knowledge base for past decisions
    const results = knowledgeBase.filter(meeting => {
      const matchesQuery =
        meeting.report.toLowerCase().includes(query.toLowerCase()) ||
        meeting.decisions.some(d => d.toLowerCase().includes(query.toLowerCase())) ||
        meeting.title.toLowerCase().includes(query.toLowerCase());
      return matchesQuery;
    });

    return NextResponse.json({
      success: true,
      results,
      totalFound: results.length,
    });
  }

  if (action === "get-all") {
    // Get all meeting records
    return NextResponse.json({
      success: true,
      meetings: knowledgeBase,
      totalMeetings: knowledgeBase.length,
    });
  }

  if (action === "get-by-id") {
    // Get a specific meeting record
    const record = knowledgeBase.find(m => m.id === meetingData.id);
    return NextResponse.json({
      success: !!record,
      record,
    });
  }

  if (action === "get-decisions-by-topic") {
    // Get all decisions on a specific topic with dates
    const topic = query.toLowerCase();
    const results = knowledgeBase
      .map(meeting => ({
        date: meeting.date,
        title: meeting.title,
        decisions: meeting.decisions.filter(d => d.toLowerCase().includes(topic)),
      }))
      .filter(item => item.decisions.length > 0);

    return NextResponse.json({
      success: true,
      topic,
      results,
      totalDecisions: results.reduce((sum, item) => sum + item.decisions.length, 0),
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
