
export const createCardSlot = (scene, x, y, w, h, opts = {}) => {
    const group = scene.add.container(x, y);
    const rect = scene.add.rectangle(0, 0, w, h, opts.fill ?? 0xbbbbbb, opts.alpha ?? 0.3)
        .setOrigin(0, 0)
        .setStrokeStyle(3, 0xa1a1a1)
        .setInteractive();


    group.add(rect);

    group.card = null;

    // place a card into the slot where 'newCard' is the card to replace current card in slot
    group.setCard = (newCard) => {

        // remove newCard from old slot if it has one
        if (newCard.slot && newCard.slot !== group) {
            newCard.slot.card = null;
        }

        // remove current card from the current slot if it has one
        if (group.card && group.card !== newCard) {
            group.card.slot = null;
        }

        group.card = newCard;
        newCard.slot = group;

        newCard.setPosition(group.x - group.width / 2, group.y);
    };

    // for checking whether pointer is over the slot
    group.isPointerOver = (pointer) => {
        const slotBounds = rect.getBounds();
        return slotBounds.contains(pointer.x, pointer.y);
    };

    return group;

}
