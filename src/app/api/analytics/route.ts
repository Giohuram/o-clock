import { NextRequest, NextResponse } from "next/server";

interface AnalyticsData {
  totalMeetings: number;
  totalTasksCreated: number;
  totalTasksCompleted: number;
  completionRate: number;
  overdueTasksCount: number;
  tasksByOwner: Record<string, { assigned: number; completed: number; overdue: number }>;
  recurringTopics: Record<string, number>;
  averageTasksPerMeeting: number;
  weeklyTrend: Array<{ date: string; tasks: number; completed: number }>;
}

// Simulated analytics data (in production, this would come from a real database)
const analyticsData: AnalyticsData = {
  totalMeetings: 0,
  totalTasksCreated: 0,
  totalTasksCompleted: 0,
  completionRate: 0,
  overdueTasksCount: 0,
  tasksByOwner: {},
  recurringTopics: {},
  averageTasksPerMeeting: 0,
  weeklyTrend: [],
};

export async function POST(req: NextRequest) {
  const { action, updateData } = await req.json();

  if (action === "update") {
    // Update analytics with new meeting data
    if (updateData.meetingCount) analyticsData.totalMeetings += 1;
    if (updateData.taskCount) {
      analyticsData.totalTasksCreated += updateData.taskCount;
      analyticsData.averageTasksPerMeeting =
        analyticsData.totalTasksCreated / analyticsData.totalMeetings;
    }
    if (updateData.completedTasks) {
      analyticsData.totalTasksCompleted += updateData.completedTasks;
      analyticsData.completionRate =
        (analyticsData.totalTasksCompleted / analyticsData.totalTasksCreated) * 100;
    }

    return NextResponse.json({
      success: true,
      analytics: analyticsData,
    });
  }

  if (action === "get-dashboard") {
    // Return dashboard metrics
    return NextResponse.json({
      success: true,
      metrics: {
        totalMeetings: analyticsData.totalMeetings,
        totalTasksCreated: analyticsData.totalTasksCreated,
        totalTasksCompleted: analyticsData.totalTasksCompleted,
        completionRate: Math.round(analyticsData.completionRate),
        overdueTasksCount: analyticsData.overdueTasksCount,
        averageTasksPerMeeting: analyticsData.averageTasksPerMeeting.toFixed(2),
        alerts: generateAlerts(analyticsData),
      },
    });
  }

  if (action === "get-team-performance") {
    // Get per-team performance metrics
    const teamPerformance = Object.entries(analyticsData.tasksByOwner).map(
      ([owner, stats]) => ({
        name: owner,
        assigned: stats.assigned,
        completed: stats.completed,
        overdue: stats.overdue,
        completionRate: Math.round((stats.completed / stats.assigned) * 100 || 0),
      })
    );

    return NextResponse.json({
      success: true,
      teamPerformance,
      teamsNeedingAttention: teamPerformance.filter((t) => t.completionRate < 70),
    });
  }

  if (action === "get-insights") {
    // Get executive insights
    return NextResponse.json({
      success: true,
      insights: {
        topicFrequency: Object.entries(analyticsData.recurringTopics)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5),
        completionTrend: analyticsData.weeklyTrend,
        riskAreas:
          analyticsData.completionRate < 70
            ? "Low completion rate detected - recommend team review"
            : "Team performance healthy",
      },
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

function generateAlerts(data: AnalyticsData): string[] {
  const alerts: string[] = [];

  if (data.completionRate < 70) {
    alerts.push(
      `⚠️ Task completion rate is ${Math.round(data.completionRate)}% - below 70% threshold`
    );
  }

  if (data.overdueTasksCount > 5) {
    alerts.push(`🚨 ${data.overdueTasksCount} tasks are now overdue - escalation needed`);
  }

  if (data.totalMeetings > 10 && data.completionRate === 0) {
    alerts.push("⚠️ No tasks have been completed yet despite 10+ meetings");
  }

  if (alerts.length === 0) {
    alerts.push("✅ All metrics are healthy");
  }

  return alerts;
}
