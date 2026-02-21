pub mod tests;
//
//
// Yeah — that combo is actually perfect **as long as you split the roles**:
//
// * **Cockpit** = your *manual control panel* (learn + inspect + debug)
// * **Rust runner** = your *automation layer* (repeatable actions)
//
// If you try to make Rust replace Cockpit immediately, you’ll fight the environment. If you use Cockpit to understand what’s happening while you build the runner, you’ll level up fast.
//
// ## How to do both without wasting time
//
// ### 1) Let Cockpit be “truth”
//
// Use Cockpit (or `virsh`) to do the first-time setup and confirm behaviors:
//
// * does libvirtd start?
// * are you using `qemu:///system` or `qemu:///session`?
// * what network is active? (`default` NAT network)
// * can a dummy VM start/stop?
// * what does the domain XML look like?
//
// This gives you a known-good baseline.
//
// ### 2) Make your Rust runner only do 5 things at first
//
// Your MVP runner should just wrap what you can already do in Cockpit:
//
// 1. `list` domains
// 2. `define` domain from XML
// 3. `start` domain
// 4. `shutdown` domain (graceful)
// 5. `destroy` domain (force off)
//
// That’s enough to feel real progress without getting stuck in “VM creation complexity.”
//
// ### 3) Use Cockpit to *create one VM*, then steal the XML
//
// This is the cheat code.
//
// * Create a VM in Cockpit (manual)
// * Export / copy the domain XML (`virsh dumpxml <name>`)
// * Use that XML as input to your Rust runner’s `define` command
//
// Now your Rust code doesn’t need to “invent” a VM schema yet — it just automates lifecycle.
//
// ---
//
// ## A clean learning/implementation workflow
//
// Do this loop:
//
// 1. Create/modify VM in Cockpit
// 2. Verify it works
// 3. Extract XML (`virsh dumpxml`)
// 4. Teach the runner to reproduce the same thing
// 5. Delete VM
// 6. Runner recreates it
//
// You’re basically turning manual steps into code. That’s real infra engineering.
//
// ---
//
// ## Practical suggestion for your environment
//
// On the Raspberry Pi:
//
// * If you’re hosting x86_64 VMs on ARM, that’s **QEMU emulation**, which is slower (fine for learning, rough for heavy OS work).
// * Still totally worth it for learning libvirt/processes/services.
// * For speed and less pain, run **ARM guests** on the Pi if you can.
//
// In GitHub Actions:
//
// * use `qemu:///session` for tests
// * treat it like an integration lab, not a production environment
//
// ---
//
// ## Guardrails so you don’t get distracted
//
// Limit Cockpit usage to:
//
// * initial setup
// * debugging when your runner fails
//
// Everything else should move into the runner.
//
// If you notice yourself spending hours tweaking Cockpit UI, stop and translate the behavior into CLI/API steps.
//
// ---
//
// ## What I would build next (concrete)
//
// In Rust:
//
// * `vmctl list`
// * `vmctl define --name X --xml ./vm.xml`
// * `vmctl start X`
// * `vmctl shutdown X`
// * `vmctl destroy X`
// * `vmctl dumpxml X`
//
// Once you have that, you’ve basically built a real hypervisor client.
//
// If you paste what crate you’re using (`virt`, `libvirt`, `libvirt-sys`) and your current command layout (or desired CLI), I’ll sketch the exact module structure + commands so you can implement it cleanly without fighting Rust module scope issues again.
//
use virt::connect::Connect;
fn main() {
    println!("Hello, world!");
    if let Ok(mut conn) = Connect::open(Some("test:///default")) {
        assert_eq!(Ok(0), conn.close());
    }
}

pub fn connect_to_virt() {
    println!("Hello, world!");
    if let Ok(mut conn) = Connect::open(Some("test:///default")) {
        assert_eq!(Ok(0), conn.close());
    }
}
#[cfg(test)]
pub mod testing {
    use crate::connect_to_virt;
    #[test]
    fn name() {
        connect_to_virt();
    }
}
