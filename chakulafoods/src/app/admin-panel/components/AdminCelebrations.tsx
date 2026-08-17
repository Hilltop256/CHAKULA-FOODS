"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Clock3, Mail, Phone, Users, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Request {
  id: string;
  name: string;
  celebration_type: string;
  number_of_guests: number;
  date: string;
  time: string;
  email: string | null;
  phone: string;
  status: "new" | "contacted" | "quoted" | "closed";
  created_at: string;
}

export default function AdminCelebrations() {
  const supabase = createClient();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("celebration_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      toast.error("Failed to load celebration requests");
    } else {
      setRequests((data || []) as Request[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const updateStatus = async (id: string, status: Request["status"]) => {
    const { error } = await supabase.from("celebration_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error("Failed to update request");
    else {
      setRequests(current => current.map(item => item.id === id ? { ...item, status } : item));
      toast.success("Request status updated");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this celebration request?")) return;
    const { error } = await supabase.from("celebration_requests").delete().eq("id", id);
    if (error) toast.error("Failed to delete request");
    else {
      setRequests(current => current.filter(item => item.id !== id));
      toast.success("Request deleted");
    }
  };

  if (loading) return <div className="card-base p-10 text-center animate-pulse">Loading celebration requests...</div>;

  return (
    <div className="space-y-5 max-w-screen-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Celebrations</h2>
          <p className="text-sm text-muted-foreground mt-1">Incoming requests for parties and celebrations.</p>
        </div>
        <button onClick={fetchRequests} className="btn-outline flex items-center gap-2 text-sm"><RefreshCw size={14}/>Refresh</button>
      </div>

      <div className="space-y-3">
        {requests.map(request => (
          <div key={request.id} className="card-base p-4 md:p-5">
            <div className="flex flex-col xl:flex-row xl:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-extrabold text-foreground">{request.name}</h3>
                  <span className="text-xs font-bold rounded-full px-2.5 py-1 bg-primary/10 text-primary">{request.celebration_type}</span>
                  <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-muted text-muted-foreground capitalize">{request.status}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                  <span><Users size={14} className="inline mr-1"/> {request.number_of_guests} guests</span>
                  <span><CalendarDays size={14} className="inline mr-1"/> {request.date}</span>
                  <span><Clock3 size={14} className="inline mr-1"/> {request.time}</span>
                  <span><Phone size={14} className="inline mr-1"/> {request.phone}</span>
                  {request.email && <span><Mail size={14} className="inline mr-1"/> {request.email}</span>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={request.status} onChange={e => updateStatus(request.id, e.target.value as Request["status"])} className="input-field h-9 text-sm">
                  <option value="new">New</option><option value="contacted">Contacted</option><option value="quoted">Quoted</option><option value="closed">Closed</option>
                </select>
                <button onClick={() => remove(request.id)} className="p-2 rounded-lg border border-border text-accent hover:bg-muted" title="Delete"><Trash2 size={15}/></button>
              </div>
            </div>
          </div>
        ))}
        {requests.length === 0 && <div className="card-base p-10 text-center text-sm text-muted-foreground">No celebration requests yet.</div>}
      </div>
    </div>
  );
}
