/**
 * Basic timeout-based async sleep function.
 *
 * @param ms Number of milliseconds to sleep.
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export async function retry<T>(
    callback: () => Promise<T>,
    tries: number,
    onError: ((e: any) => Promise<void> | void) | undefined,
): Promise<[T | undefined, any]> {
    const timeout = 2000;
    let lastError: any = undefined;
    for (let attempt = 0; attempt < tries; attempt++) {
        try {
            return [await callback(), undefined];
        } catch (e) {
            if (onError) await onError(e);
            lastError = e;
            await sleep(timeout * 2 ** attempt);
        }
    }
    return [undefined, lastError];
}