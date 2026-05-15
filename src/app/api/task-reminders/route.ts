import { NextRequest, NextResponse } from "next/server";

interface TaskReminder {
  taskId: string;
  owner: string;
  email: string;
  task: string;
  createdAt: string;
  deadline: string;
  status: "pending" | "confirmed" | "overdue" | "escalated" | "completed";
  remindersSent: {
    immediate: boolean;
    reminder24h: boolean;
    reminder48h: boolean;
    escalation72h: boolean;
  };
}

// In-memory storage (in production, use a real database)
let taskReminders: TaskReminder[] = [];

export async function POST(req: NextRequest) {
  const { action, taskId, owner, email, task, deadline } = await req.json();

  if (action === "create") {
    // Create new task reminder
    const reminder: TaskReminder = {
      taskId: taskId || `task-${Date.now()}`,
      owner,
      email,
      task,
      createdAt: new Date().toISOString(),
      deadline,
      status: "pending",
      remindersSent: {
        immediate: false,
        reminder24h: false,
        reminder48h: false,
        escalation72h: false,
      },
    };
    taskReminders.push(reminder);
    return NextResponse.json({ success: true, reminder });
  }

  if (action === "confirm") {
    // Mark task as confirmed
    const reminder = taskReminders.find(r => r.taskId === taskId);
    if (reminder) {
      reminder.status = "confirmed";
      reminder.remindersSent.immediate = true;
    }
    return NextResponse.json({ success: true });
  }

  if (action === "check-reminders") {
    // Check which reminders need to be sent
    const now = new Date();
    const remindersToSend: any[] = [];

    taskReminders.forEach(reminder => {
      if (reminder.status === "escalated" || reminder.status === "overdue") return;

      const createdAt = new Date(reminder.createdAt);
      const deadlineDate = new Date(reminder.deadline);
      const hoursPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      const firstName = reminder.owner.split(" ")[0];

      // Immediate notification
      if (!reminder.remindersSent.immediate && hoursPassed >= 0) {
        remindersToSend.push({
          type: "immediate",
          reminder,
          subject: `Meeting Report & Your Action Items | O'Clock AI`,
          message: `Hi ${firstName},\n\nYour meeting report is ready.\n\nYOUR ACTION ITEMS:\n→ ${reminder.task} — Due: ${reminder.deadline}\n\nPlease confirm receipt by replying to this message or clicking "Confirm". Tasks not confirmed within 24h will receive an automatic reminder.\n\n— O'Clock AI`,
        });
        reminder.remindersSent.immediate = true;
      }

      // 24h reminder
      if (!reminder.remindersSent.reminder24h && hoursPassed >= 24) {
        remindersToSend.push({
          type: "reminder_24h",
          reminder,
          subject: `Reminder: Task due in 48h | O'Clock AI`,
          message: `Hi ${firstName}, friendly reminder — your task "${reminder.task}" is due in 48 hours. Please confirm you're on track.\n\n— O'Clock AI`,
        });
        reminder.remindersSent.reminder24h = true;
      }

      // 48h final reminder
      if (!reminder.remindersSent.reminder48h && hoursPassed >= 48) {
        remindersToSend.push({
          type: "reminder_48h",
          reminder,
          subject: `Final Reminder: Task due in 24h | O'Clock AI`,
          message: `Hi ${firstName}, your task "${reminder.task}" is due in 24 hours. This is your final reminder before escalation.\n\n— O'Clock AI`,
        });
        reminder.remindersSent.reminder48h = true;
      }

      // 72h escalation
      if (!reminder.remindersSent.escalation72h && hoursPassed >= 72) {
        if (reminder.status !== "completed") {
          remindersToSend.push({
            type: "escalation_72h",
            reminder,
            subject: `🚨 Escalation Alert | O'Clock AI`,
            message: `Hi [Manager],\n\nThis is an automated alert. ${reminder.owner} has not completed or confirmed the following task:\n\n"${reminder.task}"\n\nOriginal deadline was ${reminder.deadline}. Please follow up.\n\n— O'Clock AI`,
          });
          reminder.remindersSent.escalation72h = true;
          reminder.status = "overdue";
        }
      }
    });

    return NextResponse.json({
      success: true,
      remindersToSend,
      totalPending: taskReminders.filter(r => r.status === "pending").length,
      totalConfirmed: taskReminders.filter(r => r.status === "confirmed").length,
      totalOverdue: taskReminders.filter(r => r.status === "overdue").length,
    });
  }

  if (action === "get-all") {
    return NextResponse.json({ tasks: taskReminders });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
