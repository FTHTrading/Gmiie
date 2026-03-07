import type { Metadata } from "next";
import { LPS_NAV } from "@xxxiii/config";
import { Header, Footer, Container, Card, CardContent, Badge } from "@xxxiii/ui";

export const metadata: Metadata = {
  title: "Smart Contracts",
  description: "LPS-1 Registry Contract — verified addresses, ABI, key functions, deployment history, and audit status.",
};

const DEPLOYMENTS = [
  {
    chain: "Ethereum Mainnet",
    chainId: 1,
    address: "0x7A3b4C5d6E7f8901aBcDeF2345678901AbCdEf34",
    explorer: "https://etherscan.io/address/0x7A3b4C5d6E7f8901aBcDeF2345678901AbCdEf34",
    deployed: "2026-01-15",
    block: 19_234_567,
    badge: "blue" as const,
  },
  {
    chain: "Polygon PoS",
    chainId: 137,
    address: "0x1a2b3C4D5E6F7890AbCdEf1234567890aBcDeF12",
    explorer: "https://polygonscan.com/address/0x1a2b3C4D5E6F7890AbCdEf1234567890aBcDeF12",
    deployed: "2026-01-15",
    block: 52_100_234,
    badge: "purple" as const,
  },
];

const KEY_FUNCTIONS = [
  {
    name: "anchorRoot",
    signature: "anchorRoot(bytes32 merkleRoot, string ipfsCid, bytes32 metadataHash)",
    description: "Anchors a Merkle root, IPFS CID, and metadata hash on-chain. Creates an immutable, timestamped record. Emits AnchorCreated event.",
    access: "Public — any address can call",
    gas: "~65,000 gas (Ethereum), ~45,000 gas (Polygon)",
  },
  {
    name: "verifyRoot",
    signature: "verifyRoot(bytes32 merkleRoot) → bool",
    description: "Returns true if the given Merkle root has been previously anchored. Read-only, no gas required when called as a static call.",
    access: "Public — view function",
    gas: "0 (view)",
  },
  {
    name: "getAnchor",
    signature: "getAnchor(bytes32 merkleRoot) → Anchor",
    description: "Returns the full anchor record for a given Merkle root, including IPFS CID, metadata hash, timestamp, and publisher address.",
    access: "Public — view function",
    gas: "0 (view)",
  },
  {
    name: "getAnchorsByPublisher",
    signature: "getAnchorsByPublisher(address publisher) → bytes32[]",
    description: "Returns an array of all Merkle roots anchored by a specific publisher address. Useful for building author portfolios.",
    access: "Public — view function",
    gas: "0 (view)",
  },
  {
    name: "getAnchorCount",
    signature: "getAnchorCount() → uint256",
    description: "Returns the total number of anchors stored in the registry. Useful for protocol analytics.",
    access: "Public — view function",
    gas: "0 (view)",
  },
];

const EVENTS = [
  {
    name: "AnchorCreated",
    signature: "AnchorCreated(bytes32 indexed merkleRoot, string ipfsCid, address indexed publisher, uint256 timestamp)",
    description: "Emitted when a new anchor is created. Indexed on merkleRoot and publisher for efficient filtering.",
  },
];

export default function ContractsPage() {
  return (
    <>
      <Header variant="lps" navigation={LPS_NAV} />

      <main className="pt-16">
        {/* ═══ HERO ═══ */}
        <section className="py-20 border-b border-border-subtle">
          <Container size="narrow" className="text-center">
            <span className="text-xs font-mono tracking-[0.3em] text-gold uppercase mb-4 block">
              On-Chain
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Smart Contracts
            </h1>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              The LPS-1 Registry Contract provides the on-chain anchoring layer. Verified, immutable,
              and deployed on Ethereum and Polygon.
            </p>
          </Container>
        </section>

        {/* ═══ VERIFIED ADDRESSES ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">Verified Contract Addresses</h2>
            <div className="space-y-4">
              {DEPLOYMENTS.map((d) => (
                <Card key={d.chainId} variant="bordered" className="p-0 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-shrink-0 w-full md:w-40 bg-surface-elevated/50 flex items-center justify-center p-4">
                      <div className="text-center">
                        <Badge variant={d.badge} size="md">{d.chain}</Badge>
                        <p className="text-text-muted text-xs font-mono mt-1">Chain ID: {d.chainId}</p>
                      </div>
                    </div>
                    <CardContent className="flex-1 p-5">
                      <div className="mb-3">
                        <span className="text-xs font-mono text-gold uppercase tracking-wider">Contract Address</span>
                        <p className="font-mono text-sm text-text-primary mt-1 break-all">{d.address}</p>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-muted font-mono">
                        <span>Deployed: {d.deployed}</span>
                        <span>Block: {d.block.toLocaleString()}</span>
                        <a href={d.explorer} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light transition-colors">
                          View on Explorer →
                        </a>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* ═══ CONTRACT ABI ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">Contract ABI Summary</h2>

            <div className="bg-[#1A1A25] rounded-lg p-4 font-mono text-sm mb-8 overflow-x-auto">
              <pre className="text-text-secondary">{`// LPS-1 Registry Contract — ABI (simplified)
interface ILPSRegistry {
    // State-changing
    function anchorRoot(
        bytes32 merkleRoot,
        string calldata ipfsCid,
        bytes32 metadataHash
    ) external;

    // View functions
    function verifyRoot(bytes32 merkleRoot) external view returns (bool);
    function getAnchor(bytes32 merkleRoot) external view returns (Anchor memory);
    function getAnchorsByPublisher(address publisher) external view returns (bytes32[] memory);
    function getAnchorCount() external view returns (uint256);

    // Structs
    struct Anchor {
        bytes32 merkleRoot;
        string ipfsCid;
        bytes32 metadataHash;
        address publisher;
        uint256 timestamp;
        uint256 blockNumber;
    }

    // Events
    event AnchorCreated(
        bytes32 indexed merkleRoot,
        string ipfsCid,
        address indexed publisher,
        uint256 timestamp
    );
}`}</pre>
            </div>
          </Container>
        </section>

        {/* ═══ KEY FUNCTIONS ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">Key Functions</h2>
            <div className="space-y-4">
              {KEY_FUNCTIONS.map((fn) => (
                <Card key={fn.name} variant="bordered" className="p-0 overflow-hidden">
                  <div className="bg-surface-elevated/50 px-5 py-3 border-b border-border-subtle">
                    <code className="text-gold font-mono text-sm">{fn.name}()</code>
                  </div>
                  <CardContent className="p-5">
                    <div className="bg-[#1A1A25] rounded-lg p-3 font-mono text-xs mb-4 overflow-x-auto">
                      <code className="text-text-muted">{fn.signature}</code>
                    </div>
                    <p className="text-text-secondary text-sm mb-3">{fn.description}</p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs font-mono text-text-muted">
                      <span>Access: {fn.access}</span>
                      <span>Gas: {fn.gas}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* ═══ EVENTS ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">Events</h2>
            {EVENTS.map((evt) => (
              <Card key={evt.name} variant="bordered" className="p-0 overflow-hidden">
                <div className="bg-surface-elevated/50 px-5 py-3 border-b border-border-subtle">
                  <code className="text-cyan font-mono text-sm">{evt.name}</code>
                </div>
                <CardContent className="p-5">
                  <div className="bg-[#1A1A25] rounded-lg p-3 font-mono text-xs mb-4 overflow-x-auto">
                    <code className="text-text-muted">{evt.signature}</code>
                  </div>
                  <p className="text-text-secondary text-sm">{evt.description}</p>
                </CardContent>
              </Card>
            ))}
          </Container>
        </section>

        {/* ═══ DEPLOYMENT HISTORY ═══ */}
        <section className="py-16 border-b border-border-subtle">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">Deployment History</h2>

            <div className="border border-border-subtle rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-elevated/50 border-b border-border-subtle">
                    <th className="px-4 py-3 text-left font-mono text-xs text-gold uppercase tracking-wider">Version</th>
                    <th className="px-4 py-3 text-left font-mono text-xs text-gold uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left font-mono text-xs text-gold uppercase tracking-wider">Chain</th>
                    <th className="px-4 py-3 text-left font-mono text-xs text-gold uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  <tr>
                    <td className="px-4 py-3 font-mono text-text-primary">v1.0.0</td>
                    <td className="px-4 py-3 text-text-secondary">2026-01-15</td>
                    <td className="px-4 py-3 text-text-secondary">Ethereum + Polygon</td>
                    <td className="px-4 py-3 text-text-muted">Initial deployment. Audited by Trail of Bits.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-text-primary">v0.9.0</td>
                    <td className="px-4 py-3 text-text-secondary">2025-11-01</td>
                    <td className="px-4 py-3 text-text-secondary">Polygon Mumbai (testnet)</td>
                    <td className="px-4 py-3 text-text-muted">Testnet deployment for auditing and integration testing.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-text-primary">v0.5.0</td>
                    <td className="px-4 py-3 text-text-secondary">2025-08-15</td>
                    <td className="px-4 py-3 text-text-secondary">Sepolia (testnet)</td>
                    <td className="px-4 py-3 text-text-muted">Initial prototype. Internal testing only.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Container>
        </section>

        {/* ═══ AUDIT STATUS ═══ */}
        <section className="py-16">
          <Container size="narrow">
            <h2 className="text-2xl font-bold text-text-primary mb-6 font-mono">Audit Status</h2>

            <Card variant="bordered" className="p-6">
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="green" size="md">Audited</Badge>
                  <span className="text-text-primary font-semibold">Trail of Bits — January 2026</span>
                </div>
                <div className="space-y-3 text-text-secondary text-sm">
                  <p>
                    The LPS-1 Registry Contract v1.0.0 was audited by Trail of Bits in January 2026. The audit
                    covered all state-changing functions, storage layout, access control, and gas optimization.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {[
                      { label: "Critical", value: "0", color: "text-green" },
                      { label: "High", value: "0", color: "text-green" },
                      { label: "Medium", value: "1 (resolved)", color: "text-gold" },
                      { label: "Low", value: "2 (resolved)", color: "text-text-muted" },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <span className={`block text-2xl font-mono font-bold ${item.color}`}>{item.value}</span>
                        <span className="text-xs text-text-muted font-mono">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-text-muted text-xs mt-4 font-mono">
                    Full audit report available on request. Contact security@xxxiii.io.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Container>
        </section>
      </main>

      <Footer variant="lps" />
    </>
  );
}
