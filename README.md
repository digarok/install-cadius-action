# cadius-action
A Github Action for installing Cadius and allowing you to manipulate ProDOS disk images with it.


# Example usage
```
    # This will install Cadius on your Github Runner machine
    - name: Install Cadius
      uses: digarok/cadius-action@node
      with:
        include_prodos: true
    
    # Now you can use it to create a new bootable ProDOS disk
    - name: Create Boot Volume
    - run: |
        cadius createvolume exampledsk.po exampledsk 140KB
        cadius addfile exampledsk.po /exampledsk/ ./PRODOS.2.4.2/PRODOS
```

# Arguments/Inputs

This action has one input: `include_prodos`.  By setting this to true, it will download the latest release of ProDOS (2.4.2) and extract all of the files to a directory called `PRODOS.2.4.2`.   This allows you to use those files, if needed, in subsequent steps.  So you can create a bootable disk or even add `BASIC.SYSTEM` to launch into AppleSoft BASIC.

# About CADIUS
Cadius is a disk image program originally by the amazing French team, Brutal Deluxe.  They are not involved with this Open Source version, but I do recommend you view [their site](http://brutaldeluxe.fr/products/crossdevtools/cadius/) for more information on Cadius and their other incredible tools and releases.
