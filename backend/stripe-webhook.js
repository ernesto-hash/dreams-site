require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const { createClient } = require("@supabase/supabase-js");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const app = express();
const PORT = process.env.PORT || 3002;

// Para receber o raw body necessário para validar webhook
app.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Apenas processar eventos de checkout finalizados
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("✅ Pagamento confirmado:", session.id);

      const metadata = session.metadata;
      if (!metadata || !metadata.dream_title) {
        console.warn("⚠️ Metadata ausente, ignorando");
        return res.status(200).json({ received: true });
      }

      try {
        // Conecta ao Supabase com service role
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Evita duplicação
        const { data: existing } = await supabase
          .from("dreams")
          .select("id")
          .eq("stripe_session_id", session.id)
          .single();

        if (existing) {
          console.log("⚠️ Sonho já salvo anteriormente");
          return res.status(200).json({ received: true });
        }

        // Insere sonho pago
        const { error } = await supabase.from("dreams").insert([
          {
            title: metadata.dream_title,
            description: metadata.dream_description,
            author: metadata.dream_author,
            country: metadata.dream_country,
            language: metadata.dream_language || null,
            likes: 0,
            views: 0,
            paid: true,
            stripe_session_id: session.id,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          console.error("❌ Supabase insert error:", error);
          return res.status(500).send("Database error");
        }

        console.log("🎉 Sonho salvo com sucesso (PAGO)");
      } catch (dbError) {
        console.error("❌ Webhook DB error:", dbError);
        return res.status(500).send("Internal error");
      }
    }

    res.json({ received: true });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Stripe Webhook server running on port ${PORT}`);
});
