import { useState, useEffect } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

/**
 * SalesManagerDashboard.jsx
 * Covers all 5 features:
 * 1. Price / discount setter
 * 2. Discount handled via same price setter
 * 3. Invoice list + PDF download
 * 4. Revenue / profit chart
 * 5. Refund request list & approve / reject
 *
 * Tailwind + shadcn/ui for styling; Recharts for chart.
 */

export default function SalesManagerDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Sales Manager Panel</h1>
      <Tabs defaultValue="pricing">
        <TabsList>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>

        {/* ------- Pricing Tab ------- */}
        <TabsContent value="pricing">
          <PricingTab />
        </TabsContent>

        {/* ------- Invoices Tab ------- */}
        <TabsContent value="invoices">
          <InvoicesTab />
        </TabsContent>

        {/* ------- Revenue Tab ------- */}
        <TabsContent value="revenue">
          <RevenueTab />
        </TabsContent>

        {/* ------- Refunds Tab ------- */}
        <TabsContent value="refunds">
          <RefundsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ------------- Pricing / Discount -------------
function PricingTab() {
  const [productId, setProductId] = useState("");
  const [price, setPrice] = useState("");
  const handleSubmit = async () => {
    try {
      await fetch(`/sales/product/${productId}/price`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Number(price) }),
      });
      toast.success("Price updated 🎉");
    } catch {
      toast.error("Update failed");
    }
  };
  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="pid">Product ID</Label>
          <Input id="pid" value={productId} onChange={(e) => setProductId(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">New Price</Label>
          <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <Button onClick={handleSubmit}>Set Price / Discount</Button>
      </CardContent>
    </Card>
  );
}

// ------------- Invoices -------------
function InvoicesTab() {
  const [start, setStart] = useState("2025-05-01");
  const [end, setEnd] = useState("2025-05-31");
  const [invoices, setInvoices] = useState([]);

  const fetchInvoices = async () => {
    const res = await fetch(`/sales/invoices?startDate=${start}&endDate=${end}`);
    const data = await res.json();
    setInvoices(data);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div>
          <Label>Start</Label>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <Label>End</Label>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <Button onClick={fetchInvoices}>Fetch</Button>
      </div>

      <Card>
        <CardContent className="p-4 overflow-auto max-h-[400px]">
          <table className="w-full text-sm">
            <thead className="text-left font-semibold">
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((o) => (
                <tr key={o._id} className="border-t">
                  <td>{o._id.slice(-6)}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>${o.totalPrice.toFixed(2)}</td>
                  <td>
                    <a
                      href={`/sales/invoice/${o._id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ------------- Revenue Chart -------------
function RevenueTab() {
  const [start, setStart] = useState("2025-05-01");
  const [end, setEnd] = useState("2025-05-31");
  const [data, setData] = useState([]);

  const fetchData = async () => {
    const res = await fetch(`/sales/revenue?startDate=${start}&endDate=${end}`);
    const json = await res.json();
    const chartData = json.map((d) => ({
      period: d.period?.day ? `${d.period.month}/${d.period.day}` : `M${d.period.month}`,
      revenue: d.revenue,
      profit: d.profit,
    }));
    setData(chartData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div>
          <Label>Start</Label>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <Label>End</Label>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <Button onClick={fetchData}>Load Chart</Button>
      </div>

      <Card>
        <CardContent className="p-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" />
              <Bar dataKey="profit" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ------------- Refunds -------------
function RefundsTab() {
  const [status, setStatus] = useState("pending");
  const [list, setList] = useState([]);

  const load = async () => {
    const res = await fetch(`/sales/refunds?status=${status}`);
    setList(await res.json());
  };

  const decide = async (id, decision) => {
    await fetch(`/sales/refund/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    toast.success(`Refund ${decision}`);
    load();
  };

  useEffect(load, [status]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Label>Status</Label>
        <select
          className="border p-2 rounded-xl"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="pending">pending</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-4 overflow-auto max-h-[400px]">
          <table className="w-full text-sm">
            <thead className="text-left font-semibold">
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Total</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o._id} className="border-t">
                  <td>{o._id.slice(-6)}</td>
                  <td>{o.user?.username || o.user}</td>
                  <td>${o.totalPrice.toFixed(2)}</td>
                  <td>{o.refundReason || "-"}</td>
                  <td className="space-x-2">
                    {status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => decide(o._id, "approved")}>Approve</Button>
                        <Button variant="destructive" size="sm" onClick={() => decide(o._id, "rejected")}>Reject</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
