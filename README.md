![latest workflow](https://github.com/digarok/install-cadius-action/actions/workflows/main.yml/badge.svg)

# install-cadius-action
A Github Action for installing Cadius and allowing you to manipulate ProDOS disk images in your workflows.


# Example usage
```
    # This will install Cadius on your Github Runner machine
    - name: Install Cadius
      uses: digarok/install-cadius-action@master
      with:
        include_prodos: true
    
    # Now you can use it to create a new bootable ProDOS disk
    - name: Create Boot Volume
    - run: |
        cadius createvolume exampledsk.po exampledsk 140KB
        cadius addfile exampledsk.po /exampledsk/ ./PRODOS.2.4.2/PRODOS
```

# Arguments/Inputs

This action has one input: `include_prodos`.  It defaults to true, it will download the latest release of ProDOS (2.4.2) and extract all of the files to a directory called `PRODOS.2.4.2`.   This allows you to use those files, if needed, in subsequent steps.  So you can create a bootable disk or even add `BASIC.SYSTEM` to launch into AppleSoft BASIC.  If you don't need any of the ProDOS files, you can skip this by setting it to false and save a second or two. 

# Usage Recommendations

1. While you can call Cadius directly from [`run`](https://help.github.com/en/actions/reference/workflow-syntax-for-github-actions#jobsjob_idstepsrun) commands as shown above, it makes sense to put your packaging command(s) in a script which can be run locally with the same results.  
2. Cadius uses a specific file, `_FileInformation.txt` for inferring ProDOS filetype and access information.  That is not covered here, see the [Cadius Documentation](http://brutaldeluxe.fr/products/crossdevtools/cadius/).
3. This action is intended to pair really well with my [`install-merlin32-action`](https://github.com/digarok/install-merlin32-action) which let's you assembled the 65xx source code to build your object/system files that can then packaged inside a ProDOS image file using this action for immediate use in your emulator or flash drive.  I use this workflow to handle build and release all via Github Actions.

# About CADIUS

Cadius is a disk image program originally by the amazing French team, Brutal Deluxe.  They are not involved with this Open Source version, but I do recommend you view [their site](http://brutaldeluxe.fr/products/crossdevtools/cadius/) for more information on Cadius and their other incredible tools and releases.


# Further Examples

For a fully-integrated pipeline, see my example Apple II project here (https://github.com/digarok/apple2-assembly-github-actions-ci-example).
