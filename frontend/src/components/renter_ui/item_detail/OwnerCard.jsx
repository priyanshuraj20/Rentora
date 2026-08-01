const OwnerCard = ({ owner }) => {
  return (
    <div className="rounded-3xl border-1 border-app/80 bg-surface p-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img
          src={owner.avatar}
          className="h-10 w-10 rounded-full border-1 border-bright"
        />
        <div>
          <p className="font-semibold">{owner.name}</p>
          <p className="text-xs text-bright">Profile · Chat</p>
        </div>
      </div>

      <span className="text-sm font-semibold text-bright">
        ★ {owner.rating}
      </span>
    </div>
  );
};

export default OwnerCard;
