Flash drives are fast for many things - flash memory, especially when it's used in SSDs, has gotten a good reputation for being fast. However, flash, like many types of storage, has some problems dealing with lots of small files, so it's impractical to simply copy map tilesets from your computer to a USB drive. We're working on a better solution which consists of making an disk image, like an ISO, of the data you want to put on a drive, and then writing that image, complete with a filesystem, to the drive.

# Requirements

* This process will require familiarity with some low-level POSIX utilities, especially `dd`. This is not a guide you can run through by copying commands - it will require, at the very least, careful editing of the sample commands.
* This is written for Apple Macintosh computers. POSIX equivalents to Mac helper applications like `hdiutil` certainly exist and a guide for doing this with Linux, etc., is certainly possible.

# Create an Image from Folder

<code>
sudo hdiutil create -verbose -fs MS-DOS -fsargs "-F 32 -c 16" -srcfolder your_map_application your_map_application.dmg
</code>

This command creates an [Apple Disk Image](http://en.wikipedia.org/wiki/Apple_Disk_Image) from a folder on your computer. Notably, the image will have a FAT32 filesystem - the `-F 32` argument specifies that this will be the case, rather than FAT16, which is limited to a 2 gigabyte partition.

# Attach the Image as a Device

<code>
hdiutil attach -nomount your_map_application.dmg
</code>

Note the output of this command: if it succeeds, it will report something like `/dev/disk3`.

# Attach USB Drive

Put the USB flash device in your computer's USB port, and then run `df` in the console and note the output. The leftmost column shows what the device of the USB flash drive is, and the rightmost will show the mount point. Remember the left column (which will be something like `/dev/disk1s2`) and then run

<code>
umount /Volumes/USBDrive
</code>

To unmount the drive

# Image the drive

Make absolutely sure that the if and of parameters of the following command are accurate; the dd utility is able to write over essential data if you accidentally put the device of another drive in the of parameter.

<code>
sudo dd if=/dev/FROM_DISKIMAGE of=/dev/TO_USBDRIVE bs=32k
</code>

You can tune the last parameter, bs, which specifies the block size of the transfer operation.

# Checking progress

The `dd` operation that is now running can take a while, and it doesn't provide any status information. However, it can.

Open a new terminal and run

<code>
~$ ps aux | grep "dd"
tmcw      1797   0.3  0.0  2425520    176 s001  R+   12:30PM   0:00.01 grep dd
root      1698   0.1  0.0  2434768    252 s000  U+   12:18PM   0:01.67 dd if=/dev/disk2 of=/dev/disk1s2 bs=32k
root        58   0.0  0.0  2436444    852   ??  Ss   10:16AM   0:00.04 /usr/libexec/hidd
</code>

Note the process id: the first number in the row of your `dd` process. In the above output, it is 1698. Use this id in the following command.

<code>
~$ sudo kill -s INFO PROCESS_ID
</code>

Going back to the terminal which is running dd will show a count of how many bytes have been transferred. To get a figure in megabytes, you can use the `units` utility.

<code>
~$ units "70000 bytes" "megabytes"
	* 0.066757202
	/ 14.979657
</code>

So, 70000 bytes is 0.06 megabytes.

When `dd` completes, it will output a summary of how much information was transferred and in what timeframe.

