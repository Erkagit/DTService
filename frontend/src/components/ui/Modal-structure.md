// Proper Modal Structure for Next.js + Tailwind CSS

// 1. Modal Overlay (Full screen, centered content)
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
  {/* 2. Modal Container (Constrained width, responsive) */}
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-auto">
    {/* 3. Modal Header */}
    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
      <h2 className="text-lg font-semibold text-gray-900">Modal Title</h2>
      <button className="p-2 hover:bg-gray-100 rounded-lg">
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* 4. Modal Content */}
    <div className="p-6">
      <p>Modal content goes here...</p>

      {/* 5. Modal Actions (Natural width buttons, right-aligned) */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  </div>
</div>

// Key Points:
// - Overlay: fixed inset-0 with backdrop
// - Container: w-full max-w-lg (or your preferred size)
// - Buttons: justify-end gap-3, NO fullWidth prop
// - Responsive: p-4 on mobile, p-6 on larger screens