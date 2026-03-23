<script>
  import { onMount } from "svelte";

  let filings = $state([]);
  let filtered = $state([]);
  let activeTab = $state("pending");

  let stats = $state({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  });

  onMount(async () => {
    const admin = localStorage.getItem("admin");
    if (!admin) window.location.href = "/admin/login";

    const res = await fetch("/api/admin/filings");
    filings = await res.json();

    updateUI();
  });

  function updateUI() {
    stats = {
      pending: filings.filter((f) => (f.status || "pending") === "pending")
        .length,
      approved: filings.filter((f) => f.status === "approved").length,
      rejected: filings.filter((f) => f.status === "rejected").length,
      total: filings.length,
    };
    applyFilter();
  }

  function applyFilter() {
    filtered =
      activeTab === "all"
        ? [...filings]
        : filings.filter((f) => (f.status || "pending") === activeTab);
  }

  function setTab(tab) {
    activeTab = tab;
    applyFilter();
  }

  let showModal = $state(false);
  let selectedFiling = $state(null);
  let adminNote = $state("");

  function openReview(filing) {
    selectedFiling = filing;
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    selectedFiling = null;
    adminNote = "";
  }

  async function updateStatus(id, status) {
    await fetch("/api/admin/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        status,
        note: adminNote, // 🔥 important
      }),
    });

    async function deleteFiling(id) {
      await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      filings = filings.filter((f) => f.id !== id);

      updateUI();
    }

    filings = filings.map((f) =>
      f.id === id ? { ...f, status, admin_note: adminNote } : f,
    );

    updateUI();
    closeModal();
  }
</script>

<div class="container">
  <h2 class="title">Filing Administration</h2>

  <!-- STATS -->
  <div class="stats">
    <div class="stat-card">
      <div class="num pending">{stats.pending}</div>
      <div class="label">PENDING</div>
    </div>

    <div class="stat-card">
      <div class="num approved">{stats.approved}</div>
      <div class="label">APPROVED</div>
    </div>

    <div class="stat-card">
      <div class="num rejected">{stats.rejected}</div>
      <div class="label">REJECTED</div>
    </div>

    <div class="stat-card">
      <div class="num total">{stats.total}</div>
      <div class="label">TOTAL</div>
    </div>
  </div>

  <!-- TABS -->
  <div class="tabs">
    <div
      class:active={activeTab === "pending"}
      on:click={() => setTab("pending")}
    >
      PENDING
      {#if stats.pending > 0}
        <span class="badge">{stats.pending}</span>
      {/if}
    </div>

    <div
      class:active={activeTab === "approved"}
      on:click={() => setTab("approved")}
    >
      APPROVED
    </div>

    <div
      class:active={activeTab === "rejected"}
      on:click={() => setTab("rejected")}
    >
      REJECTED
    </div>

    <div class:active={activeTab === "all"} on:click={() => setTab("all")}>
      ALL
    </div>
  </div>

  <!-- TABLE -->
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>DATE</th>
          <th>ACCESSION</th>
          <th>REGISTRANT</th>
          <th>FILER</th>
          <th>STATUS</th>
          <th>ACTIONS</th>
        </tr>
      </thead>

      <tbody>
        {#each filtered as f}
          <tr>
            <td>{new Date(f.created_at).toLocaleDateString()}</td>

            <td class="link">{f.accession_number}</td>

            <td>
              <strong>{f.company_name}</strong><br />
              <span class="sub">CIK: {f.company_cik || "-"}</span>
            </td>

            <td>
              {f.filer_name}<br />
              <span class="sub">CIK: {f.filer_cik || "-"}</span>
            </td>

            <td>
              <span class="status {f.status}">
                {f.status}
              </span>
            </td>

            <td class="actions">
              <button class="review" on:click={() => openReview(f)}
                >REVIEW</button
              >
              <button
                class="approve"
                on:click={() => updateStatus(f.id, "approved")}
              >
                APPROVE
              </button>

              <button
                class="reject"
                on:click={() => updateStatus(f.id, "rejected")}
              >
                REJECT
              </button>

              <button class="delete" on:click={() => deleteFiling(f.id)}>
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M9 3v1H4v2h16V4h-5V3H9m1 4h2v10h-2V7m4 0h2v10h-2V7M6 7h2v10H6V7Z"
                  />
                </svg>
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  {#if showModal && selectedFiling}
    <div class="modal-overlay">
      <div class="modal">
        <!-- HEADER -->
        <div class="modal-header">
          <h3>Review: {selectedFiling.accession_number}</h3>
          <button on:click={closeModal}>×</button>
        </div>

        <!-- BODY -->
        <div class="modal-body">
          <!-- <div class="status-tag">{selectedFiling.status}</div> -->
          <div class="status-row">
            <div class="tag">
              {selectedFiling?.accession_number?.split("-")[0]}
            </div>

            <div class="status-tag">{selectedFiling.status}</div>
          </div>
          <h2 class="main-title">
            Exempt Solicitation — {selectedFiling.subject}
          </h2>

          <p class="date">
            Filed {new Date(selectedFiling.created_at).toLocaleDateString()}
          </p>

          <hr />

          <!-- <div class="section">
        <h4>FILING INFORMATION</h4>

        <p><strong>Company:</strong> {selectedFiling.company_name}</p>
        <p><strong>Registrant CIK:</strong> {selectedFiling.company_cik || '-'}</p>
        <p><strong>DEF 14A:</strong> 
          <a href={selectedFiling.def14a_link} target="_blank">
            {selectedFiling.def14a_link}
          </a>
        </p>
        <p><strong>Filer:</strong> {selectedFiling.filer_name}</p>
        <p><strong>Contact:</strong> {selectedFiling.contact_name || '-'}</p>
      </div> -->
          <div class="section">
            <h4>FILING INFORMATION</h4>

            <div class="grid">
              <div>COMPANY</div>
              <div>{selectedFiling.company_name}</div>

              <div>REGISTRANT CIK</div>
              <div>{selectedFiling.company_cik || "-"}</div>

              <div>DEF 14A FILING</div>
              <div>
                <a href={selectedFiling.def14a_link} target="_blank">
                  {selectedFiling.def14a_link}
                </a>
              </div>

              <div>PROPOSAL ITEM</div>
              <div>{selectedFiling.item_number || "-"}</div>

              <div>FILER</div>
              <div>{selectedFiling.filer_name}</div>

              <div>FILER CIK</div>
              <div>{selectedFiling.filer_cik || "-"}</div>

              <div>CONTACT</div>
              <div>
                {selectedFiling.contact_name || "-"} · {selectedFiling.contact_email ||
                  "-"}
              </div>
            </div>
          </div>
          <hr />

          <div class="section">
            <h4>WRITTEN MATERIALS</h4>

            <a
              class="pdf-link"
              href={`/${selectedFiling.pdf_s3_key}`}
              target="_blank"
            >
              📄 {selectedFiling.pdf_filename}
            </a>
          </div>

          <hr />

          <div class="section">
            <h4>DESCRIPTION</h4>
            <p>{selectedFiling.description}</p>
          </div>

          <hr />

          <div class="section">
            <h4>ADMIN NOTES</h4>

            <div class="note-row">
              <textarea bind:value={adminNote} placeholder="Add review note..."
              ></textarea>
              <button class="add-btn">ADD</button>
            </div>
          </div>
        </div>

        <!-- FOOTER -->
        <div class="modal-footer">
          <button
            class="approve"
            on:click={() => updateStatus(selectedFiling.id, "approved")}
          >
            ✓ APPROVE
          </button>

          <button
            class="reject"
            on:click={() => updateStatus(selectedFiling.id, "rejected")}
          >
            ✕ REJECT
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  body {
    font-family: "DM Serif Display", Georgia, serif !important;
  }
  .container {
    padding: 40px 10px;
    background: #f5f2ec;
  }

  .title.s-8yXO12Wbi8z8 {
    margin-bottom: 25px;
    font-size: 28px;
    color: #1f3b5b;
    font-family: "DM Serif Display", Georgia, serif !important;
  }

  /* STATS */
  .stats {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
  }
  .s-8yXO12Wbi8z8 {
    font-family: "IBM Plex Mono", "Courier New", monospace !important;
  }
  .stat-card {
    flex: 1;
    background: white;
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    border: 1px solid #e5e0d8;
  }

  .num {
    font-size: 28px;
    font-weight: bold;
  }

  .pending {
    color: #b7791f;
  }
  .approved {
    color: #2f855a;
  }
  .rejected {
    color: #c53030;
  }
  .total {
    color: #2b6cb0;
  }

  .label {
    font-size: 12px;
    letter-spacing: 1px;
    margin-top: 5px;
  }

  /* TABS */
  .tabs.s-8yXO12Wbi8z8 {
    display: flex;
    gap: 30px;
    border-bottom: 1px solid #ddd;
    margin-bottom: 20px;
    font-family: "IBM Plex Mono", "Courier New", monospace !important;
  }

  .tabs div {
    padding-bottom: 10px;
    cursor: pointer;
    font-size: 14px;
  }

  .tabs .active {
    border-bottom: 2px solid #1f3b5b;
    font-weight: 600;
  }

  .badge {
    background: #c53030;
    color: white;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    margin-left: 6px;
  }

  /* TABLE */
  .table-wrap {
    background: white;
    border-radius: 10px;
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th {
    background: #f3efe9;
    text-align: left;
    padding: 12px;
    font-size: 12px;
  }

  td {
    padding: 12px;
    border-top: 1px solid #eee;
  }

  .link {
    color: #2b6cb0;
    font-weight: bold;
  }

  .sub {
    font-size: 11px;
    color: #777;
  }

  /* STATUS */
  .status {
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
  }

  .status.pending {
    background: #fef3c7;
    color: #92400e;
  }

  .status.approved {
    background: #d1fae5;
    color: #065f46;
  }

  .status.rejected {
    background: #fee2e2;
    color: #7f1d1d;
  }

  /* ACTIONS */
  .actions button {
    margin-right: 5px;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 6px;
    cursor: pointer;
  }

  .review {
    border: 1px solid #2b6cb0;
    color: #2b6cb0;
    background: #e8f0fe;
  }
  .approve {
    border: 1px solid green;
    color: green;
    background-image: #e6f4ea;
  }
  .reject {
    border: 1px solid red;
    color: red;
    background-color: #fde8e4;
  }
  .delete {
    border: 1px solid #ccc;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: flex-start; /* 🔥 was center */
    justify-content: center;
    padding-top: 60px; /* 🔥 pushes modal down */
    z-index: 999;
  }

  .modal {
    width: 720px;
    background: #f8f5f0;
    border-radius: 10px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    background: #1f3b5b;
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
  }

  .modal-body {
    padding: 20px;
    overflow-y: auto; /* 🔥 scroll inside */
    flex: 1;

    /* 🔥 ADD THESE */
    overflow-x: hidden; /* prevent horizontal scroll */
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  .modal-body a {
    word-break: break-all; /* 🔥 ensures long URLs wrap */
  }

  .grid div {
    word-break: break-word;
  }
  .grid div:nth-child(2) {
    white-space: normal;
    word-break: break-word;
  }
  .modal-footer {
    padding: 15px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .status-tag {
    background: #fef3c7;
    color: #92400e;
    display: inline-block;
    padding: 4px 10px;
    border-radius: 10px;
    font-size: 12px;
  }

  .section {
    margin-top: 15px;
  }

  .pdf-link {
    display: inline-block;
    background: #fde8e4;
    padding: 6px 10px;
    border-radius: 6px;
    color: #b91c1c;
    text-decoration: none;
  }

  textarea {
    width: 100%;
    margin-top: 10px;
    padding: 10px;
  }

  .add-btn {
    margin-top: 10px;
  }

  .modal-footer .approve {
    background: #e6f4ea;
    border: 1px solid #2f855a;
    color: #2f855a;
    padding: 10px 18px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
  }

  .modal-footer .approve:hover {
    background: #c6f6d5;
  }

  .modal-footer .reject {
    background: #fde8e4;
    border: 1px solid #c53030;
    color: #c53030;
    padding: 10px 18px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
  }

  .modal-footer .reject:hover {
    background: #fbd5d5;
  }

  .status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tag {
    background: #d1fae5;
    color: #065f46;
    padding: 4px 10px;
    font-size: 11px;
    border-radius: 6px;
  }

  .main-title {
    font-size: 20px;
    margin-top: 10px;
  }

  .date {
    font-size: 12px;
    color: #777;
  }

  /* GRID LIKE YOUR SCREENSHOT */
  .grid {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 8px 20px;
    font-size: 13px;
  }

  .grid div:first-child {
    color: #777;
    text-transform: uppercase;
    font-size: 11px;
  }

  .note-row {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  .note-row textarea {
    flex: 1;
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
  }

  .add-btn {
    background: #1f3b5b;
    color: white;
    padding: 0 18px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-weight: 600;
  }

  .add-btn:hover {
    background: #16324a;
  }
</style>
