import { useMemo, useState } from "react";
import API from "../services/api";

export default function useMentorRequestBulkActions(requests = []) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const requestIds = useMemo(
    () => requests.map((request) => request.id || request.request_id).filter(Boolean),
    [requests]
  );

  const toggleSelection = (requestId) => {
    setSelectedIds((previous) =>
      previous.includes(requestId)
        ? previous.filter((id) => id !== requestId)
        : [...previous, requestId]
    );
  };

  const toggleAll = (checked) => {
    setSelectedIds(checked ? requestIds : []);
  };

  const clearSelection = () => setSelectedIds([]);

  const handleAction = async (action) => {
    if (!selectedIds.length) return;
    if (
      action === "reject" &&
      !window.confirm(`Reject ${selectedIds.length} selected requests?`)
    ) {
      return;
    }

    setLoading(true);
    try {
      await Promise.all(
        selectedIds.map((requestId) =>
          action === "connect"
            ? API.post("/api/mentor/requests/", { request_id: requestId })
            : API.delete(`/api/mentor/requests/${requestId}/`)
        )
      );
      window.location.reload();
    } catch {
      alert(`Failed to ${action} selected requests.`);
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedIds,
    requestIds,
    loading,
    allSelected: requestIds.length > 0 && selectedIds.length === requestIds.length,
    toggleSelection,
    toggleAll,
    clearSelection,
    handleAction,
  };
}
