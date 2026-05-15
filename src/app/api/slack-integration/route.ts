import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { action, webhookUrl, report, tasks, reportTitle } = await req.json();

  if (action === "send-report") {
    if (!webhookUrl) {
      return NextResponse.json({ error: "Slack webhook URL required" }, { status: 400 });
    }

    try {
      // Format the report for Slack
      const message = {
        text: `📋 New Meeting Report: ${reportTitle}`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `📋 ${reportTitle}`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: report,
            },
          },
          {
            type: "divider",
          },
        ],
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      return NextResponse.json({
        success: true,
        message: "Report sent to Slack successfully",
      });
    } catch (error) {
      console.error("Slack send error:", error);
      return NextResponse.json({ error: "Failed to send to Slack" }, { status: 500 });
    }
  }

  if (action === "send-task-notification") {
    if (!webhookUrl) {
      return NextResponse.json({ error: "Slack webhook URL required" }, { status: 400 });
    }

    try {
      // Format task notifications for Slack
      const taskBlocks = tasks.map((task: any, index: number) => ({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Task ${index + 1}: ${task.description}*\n👤 Assigned to: ${task.owner}\n📅 Due: ${task.deadline}`,
        },
      }));

      const message = {
        text: "🎯 New Action Items from Meeting",
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🎯 Action Items Alert",
            },
          },
          ...taskBlocks,
          {
            type: "divider",
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: "_Powered by O'Clock AI • 72h execution deadline • Reminders at 24h & 48h_",
              },
            ],
          },
        ],
      };

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.status}`);
      }

      return NextResponse.json({
        success: true,
        message: "Task notifications sent to Slack",
      });
    } catch (error) {
      console.error("Slack send error:", error);
      return NextResponse.json({ error: "Failed to send task notification" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
