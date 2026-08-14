import { NextResponse } from "next/server";
import { databaseUnavailableResponse } from "@/lib/api-diagnostics";
import {
  applyPublicCustomerAction,
  getPublicResponseContext,
} from "@/lib/opportunity-db";
import {
  isValidPublicResponseToken,
  PUBLIC_CUSTOMER_ACTIONS,
  type PublicCustomerAction,
} from "@/lib/opportunity-lifecycle";

export const dynamic = "force-dynamic";

const INVALID_LINK = {
  error: "This response link is invalid or no longer available.",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!isValidPublicResponseToken(token)) {
    return NextResponse.json(INVALID_LINK, { status: 404 });
  }

  try {
    const context = await getPublicResponseContext(token);
    if (!context) {
      return NextResponse.json(INVALID_LINK, { status: 404 });
    }
    return NextResponse.json({ response: context });
  } catch (error) {
    return databaseUnavailableResponse("load public response", error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  if (!isValidPublicResponseToken(token)) {
    return NextResponse.json(INVALID_LINK, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const action = body?.action as PublicCustomerAction | undefined;
  const slotId = typeof body?.slotId === "string" ? body.slotId : undefined;

  if (!action || !PUBLIC_CUSTOMER_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "This action is not available." }, { status: 400 });
  }

  try {
    const result = await applyPublicCustomerAction(token, action, slotId);
    if (!result.ok) {
      if (result.reason === "invalid") {
        return NextResponse.json(INVALID_LINK, { status: 404 });
      }
      if (result.reason === "blocked") {
        return NextResponse.json(
          { error: "This opportunity is no longer accepting responses." },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: "That meeting time is not available." }, { status: 400 });
    }

    return NextResponse.json({
      response: result.context,
      confirmedSlot: result.confirmedSlot ?? null,
    });
  } catch (error) {
    return databaseUnavailableResponse("save public response", error);
  }
}
