import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { ArrowRight, FileText, Lock, Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function Landing() {
  const { user } = useAuth();

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center max-w-4xl mx-auto">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <motion.div variants={item} className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-secondary/50 backdrop-blur-sm text-secondary-foreground mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
            Privacy-First Legal AI
          </motion.div>
          
          <motion.h1 variants={item} className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-primary leading-[1.1]">
            Legal Documents, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Decoded for You.</span>
          </motion.h1>

          <motion.p variants={item} className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload any legal notice or document. Get an instant summary, key points, and action plan in your local language. Secure, private, and simple.
          </motion.p>

          <motion.div variants={item} className="pt-8">
            <Button 
              size="lg" 
              onClick={handleLogin}
              className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              Start Decoding Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. IndexedDB Local Storage.
            </p>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full">
          {[
            {
              icon: <FileText className="w-8 h-8" />,
              title: "Instant OCR & Summary",
              desc: "Upload images or PDFs. We extract text and summarize complex legalese into plain English."
            },
            {
              icon: <Globe className="w-8 h-8" />,
              title: "8+ Local Languages",
              desc: "Read summaries in Hindi, Marathi, Tamil, Telugu, and more. Justice knows no language barrier."
            },
            {
              icon: <Lock className="w-8 h-8" />,
              title: "100% Private",
              desc: "Documents are processed securely and stored only on your device (IndexedDB). Auto-deleted after 3 docs."
            }
          ].map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-6 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 font-serif">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Abstract background blobs */}
        <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />
        <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] -z-10 animate-pulse delay-700" />
      </div>
    </Layout>
  );
}
