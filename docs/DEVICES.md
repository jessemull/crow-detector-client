# Physical devices (client pointer)

> **AI agents — read this when:** working on `/porch` Shelter Cam or `/feeder` Feeder Cam copy, status, or anything that assumes how clips are produced.
> Authoritative hardware plan: **`crow-detector-server/docs/DEVICES.md`**.

---

## What the client needs to know

- Shelter Cam clips come from the **porch API** / S3, not from a browser talking to a Pi or Tapo.
- Feeder Cam feeds come from the **feeder API** (`/feeder/feeds`, `/feeder/status`) / S3; the browser never talks to a Pi or Tapo.
- Outdoor video is **sealed IP cameras + a LAN uploader** (laptop/server), not a Raspberry Pi CSI camera on the porch.
- Product surface stays Home / About / `/porch` / `/feeder`. Do not invent admin, live WebRTC players, or camera-vendor embeds unless product explicitly adds them.

---

## Do not recommend for this product

- DIY outdoor housings for CAM008 / COM1708
- Requiring a Pi on the porch for Shelter Cam
- Vendor cloud (Tapo Care, etc.) as the source of truth for `/porch`
