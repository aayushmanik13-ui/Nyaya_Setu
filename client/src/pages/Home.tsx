import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Clock, ChevronRight, FileText } from "lucide-react";
import { db, type Document } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Home() {
  const documents = useLiveQuery(() => db.documents.orderBy("createdAt").reverse().toArray());
  const [loading, setLoading] = useState(true);

  // Simulate initial Dexie load time to prevent flash
  useEffect(() => {
    if (documents !== undefined) setLoading(false);
  }, [documents]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-serif font-bold text-foreground">Your Documents</h1>
            <p className="text-muted-foreground">Access your recently decoded legal documents.</p>
          </div>
          <Link href="/upload">
            <Button size="lg" className="rounded-full shadow-md hover:shadow-lg transition-all">
              <Plus className="w-5 h-5 mr-2" />
              Scan New Document
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map((doc, idx) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link href={`/result/${doc.id}`}>
                  <div className="group bg-card hover:bg-muted/30 border border-border/50 hover:border-primary/20 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-primary/5 p-3 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        doc.decodedResult.urgency === 'High' 
                          ? 'bg-destructive/10 text-destructive border-destructive/20' 
                          : doc.decodedResult.urgency === 'Medium'
                          ? 'bg-orange-50 text-orange-600 border-orange-200'
                          : 'bg-green-50 text-green-600 border-green-200'
                      }`}>
                        {doc.decodedResult.urgency} Urgency
                      </div>
                    </div>
                    
                    <h3 className="font-serif font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {doc.decodedResult.docType || "Unknown Document"}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {doc.decodedResult.summary}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-muted-foreground/10 text-center">
            <div className="bg-muted/30 p-4 rounded-full mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
              Upload a legal document to get an instant summary and action plan.
            </p>
            <Link href="/upload">
              <Button variant="outline" className="rounded-full">
                Scan Your First Document
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
