"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api, type Campaign } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "outline",
  funded: "secondary",
  active: "default",
  completed: "secondary",
};

export default function CampaignsPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api
        .listCampaigns()
        .then(setCampaigns)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          Please sign in as an advertiser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage your advertising campaigns
          </p>
        </div>
        <Link href="/campaigns/new" className={buttonVariants()}>
          New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-3/4 rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-12 rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No campaigns yet. Create your first campaign to start placing ads
              on viral comments.
            </p>
            <Link
              href="/campaigns/new"
              className={buttonVariants({ className: "mt-4" })}
            >
              Create Campaign
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    &ldquo;{campaign.ad_text}&rdquo;
                  </CardTitle>
                  <Badge variant={statusColors[campaign.status] || "secondary"}>
                    {campaign.status}
                  </Badge>
                </div>
                <CardDescription>
                  Budget: ${(campaign.budget_cents / 100).toFixed(2)} &middot;
                  Per placement: $
                  {(campaign.price_per_placement / 100).toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Created {new Date(campaign.created_at).toLocaleDateString()}
                </span>
                <Link
                  href={`/campaigns/${campaign.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
